from app import helpers

def test_helpers_edge_cases():
    # _with_property_context should just return the field name if entity is None
    assert helpers._with_property_context(None, "suite_number") == "suite_number"

    # _display_label returns None if entity_obj is None
    assert helpers._display_label("property", None) is None

    # _display_label returns None if getattr blows up
    class BadEntity:
        def __getattr__(self, name):
            raise RuntimeError("boom")
    assert helpers._display_label("property", BadEntity()) is None
