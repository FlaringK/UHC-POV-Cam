from os import listdir, path
from collections import OrderedDict
import json

from timeline_compiler.timelines import Timelines


def to_json(obj):
    return json.dumps(obj, indent=4)


def compile_timelines(timelines_directory, expected_timelines_path, images_directory, output_path):
    # Get order of expected people from designated file
    # Read timelines in order
    # Check expected images present

    timelines = Timelines()

    actual_timeline_paths = set(listdir(timelines_directory))

    with open(expected_timelines_path, "r") as people_file:
        expected_timeline_paths = [
            '{}.txt'.format(line.strip()) for line in people_file if line.strip()
        ]

    timeline_paths = [
        timeline_path for timeline_path in expected_timeline_paths if timeline_path in actual_timeline_paths
    ]
    missing_timeline_paths = {
        timeline_path for timeline_path in expected_timeline_paths if timeline_path not in actual_timeline_paths
    }
    unexpected_timeline_paths = {
        timeline_path for timeline_path in actual_timeline_paths if timeline_path not in expected_timeline_paths
    }

    for timeline_path in timeline_paths:
        timelines.add_timeline(path.join(timelines_directory, timeline_path))

    # Pass through, replacing links from relative locations with absolute locations
    # (Note: still have links to relative locations)
    for person_name in timelines.people:
        if person_name not in timelines.next_page_links:
            continue

        for page in timelines.next_page_links[person_name]:
            for next_link in page.next_links:
                for last_page in timelines.people[person_name].last_pages:
                    last_page.link_to(next_link)
        del timelines.next_page_links[person_name]

    missing_jumps = [page_number for page_number in timelines.next_page_links if isinstance(page_number, str)]
    if missing_jumps:
        print("Missing required jumps:")
        print(missing_jumps)
        raise Exception("")

    # Now write it to file
    formated_json = json.dumps({
        "peoplenames": list(timelines.people.keys()),
        "colours": timelines.colours,
        "images": timelines.images,
        "groups": timelines.groups,
        "timelines": OrderedDict(
            (page_number, [link.to_json(timelines.get_person, timelines.next_page_links) for link in next_page_links])
            for page_number, next_page_links in sorted(timelines.next_page_links.items()))
    }, indent=4)
    with open(output_path, "w") as output_file:
        output_file.write(formated_json)

    existing_images = set(listdir(images_directory))
    missing_images = {
        image for image in timelines.images if image not in existing_images
    }
    unexpected_images = {
        image for image in existing_images if image not in timelines.images
    }

    if any((missing_images, unexpected_images, missing_timeline_paths, unexpected_timeline_paths)):
        print("Problems:")

        if missing_images:
            print("\nMissing images:")
            print("\n".join(sorted(missing_images)))

        if unexpected_images:
            print("\nUnexpected images:")
            print("\n".join(sorted(unexpected_images)))

        if missing_timeline_paths:
            print("\nMissing timeline files:")
            print("\n".join(sorted(missing_timeline_paths)))

        if unexpected_timeline_paths:
            print("\nUnexpected timeline files:")
            print("\n".join(sorted(unexpected_timeline_paths)))
