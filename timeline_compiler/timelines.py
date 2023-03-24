from collections import defaultdict, OrderedDict
import re

from timeline_compiler.objects import Person, Link


class Timelines:
    patterns = {
        "Pages": re.compile("^\d+(-\d+(-2)?)?$"),
        "==>": re.compile("^=+>$"),
        "<==": re.compile("^<=+$"),
        "GOTO": re.compile("^~\s*[\w ()'^]+$", re.IGNORECASE),
        "Name": re.compile("^Name:\s*[\w ()'^]+$", re.IGNORECASE),
        "Colour": re.compile("^Colour:\s*#[0-9A-F]{6}$", re.IGNORECASE),
        "Image": re.compile("^Image:\s*\w+\.\w+$", re.IGNORECASE),
        "Group": re.compile("^Group:\s*[\w ()']+$", re.IGNORECASE),
        "Caption": re.compile("^Caption:\s*[\w ]+$", re.IGNORECASE)
    }

    def __init__(self):
        self.colours = []
        self.images = []
        self.groups = []

        self.people = OrderedDict()
        self.next_page_links = defaultdict(list)

    def get_person(self, person_name):
        if person_name not in self.people:
            self.people[person_name] = Person(len(self.people), person_name)
        return self.people[person_name]

    @classmethod
    def tokenize_timeline_file(cls, timeline_file_location):
        with open(timeline_file_location, 'r') as timeline_file:
            yield from cls.tokenize_timeline_statements(timeline_file)

    @classmethod
    def tokenize_timeline_statements(cls, statements):
        indent_level = 0
        for line in statements:
            potential_command = line.strip()
            pattern_match = next((pattern for pattern in cls.patterns if cls.patterns[pattern].match(potential_command)), None)

            if pattern_match is None:
                continue

            # Good enough in most cases
            # May want to improve later
            next_indent_level = len(line) - len(line.lstrip())
            if next_indent_level > indent_level:
                yield ("BOT",)
            elif next_indent_level < indent_level:
                yield ("EOT",)
            indent_level = next_indent_level

            if pattern_match == "Pages":
                args = [int(s) for s in potential_command.split("-")]
                if len(args) == 1:
                    args.append(args[0])
                args[1] += 1
                yield (pattern_match,) + tuple(args)

            elif pattern_match == "GOTO":
                yield (pattern_match, potential_command[1:].strip())

            elif pattern_match in {"Name", "Colour", "Image", "Group", "Caption"}:
                yield (pattern_match, potential_command.split(":")[1].strip())

            else:
                yield (pattern_match,)

        yield ("EOT",)

    def add_timeline(self, timeline_file_location):
        self.exec_timeline_tokens(self.tokenize_timeline_file(timeline_file_location))

    def exec_timeline_tokens(self, command_iterator, previous_pages=None, current_person=None, current_colour=None, current_image=None, current_group=None, next_caption=None):
        # Page to pass into next splinter timeline
        splinter_pages = []
        # Page returned from splinter timeline
        return_pages = []

        if previous_pages is None:
            previous_pages = []

        for command, *args in command_iterator:
            if command == "Pages":
                for page_number in range(*args):
                    next_link = Link(page_number, current_person, current_colour, current_image, current_group)

                    if isinstance(current_person, Person) and current_person.first_page is None:
                        current_person.first_page = next_link

                    self.next_page_links[page_number].append(next_link)

                    for page in previous_pages:
                        page.link_to(next_link, next_caption)
                    previous_pages = [next_link]
                    next_caption = None

            elif command == "==>":
                splinter_pages = previous_pages

            elif command == "<==":
                previous_pages.extend(return_pages)

            elif command == "GOTO":
                for page in previous_pages:
                    page.link_to(args[0])
                previous_pages = [Link(args[0])]
                self.next_page_links[args[0]].append(previous_pages[0])
                next_caption = None

            elif command == "EOT":
                current_person.last_pages = previous_pages
                return previous_pages

            elif command == "BOT":
                return_pages = self.exec_timeline_tokens(command_iterator, splinter_pages, current_person, current_colour, current_image, current_group)
                splinter_pages = []

            elif command == "Name":
                current_person = self.get_person(args[0])

            elif command == "Colour":
                if not args[0] in self.colours:
                    self.colours.append(args[0])
                current_colour = self.colours.index(args[0])

            elif command == "Image":
                if not args[0] in self.images:
                    self.images.append(args[0])
                current_image = self.images.index(args[0])

            elif command == "Group":
                if not args[0] in self.groups:
                    self.groups.append(args[0])
                current_group = self.groups.index(args[0])

            elif command == "Caption":
                next_caption = args[0]
