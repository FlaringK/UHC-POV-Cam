from os import path

from timeline_compiler import compile_timelines

if __name__ == "__main__":
    current_location = path.dirname(__file__)
    compile_timelines(
        timelines_directory=path.join(current_location, "Readable Timelines"),
        expected_timelines_path=path.join(current_location, "expected_timelines.txt"),
        images_directory=path.join(current_location, "icons"),
        output_path=path.join(current_location, "timelines.json")
    )
