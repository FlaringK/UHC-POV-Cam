class Person:
    def __init__(self, person_id, name):
        self.person_id = person_id
        self.name = name

        self.first_page = None
        self.last_pages = []


class Link:
    def __init__(self, current_page_number, person=None, colour_id=None, image_id=None, group_id=None):
        self.current_page_number = current_page_number
        self.person = person
        self.colour_id = colour_id
        self.image_id = image_id
        self.group_id = group_id
        self.next_links = []
        self.next_link_captions = []

    def __str__(self):
        return "{} ==> {}: {} {} {}".format(
            self.current_page_number,
            [next_link.current_page_number if isinstance(next_link, Link) else next_link for next_link in self.next_links],
            self.person.name,
            self.colour_id,
            self.image_id
        )

    def link_to(self, next_link, caption=None):
        self.next_links.append(next_link)
        self.next_link_captions.append(caption)

    def to_json(self, get_person, next_page_links):
        next_links = (next_link if isinstance(next_link, Link) else get_person(next_link).first_page for next_link in self.next_links)
        return [
            self.person.person_id, self.colour_id, self.image_id, self.group_id,
            [
                [next_link.current_page_number, next_page_links[next_link.current_page_number].index(next_link)] + ([caption] if caption is not None else [])
                for next_link, caption in zip(next_links, self.next_link_captions)
            ]
        ]
