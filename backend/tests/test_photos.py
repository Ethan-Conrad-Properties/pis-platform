import pytest
import io

@pytest.mark.asyncio
async def test_upload_and_crud_photos(client):
    # 1. Create property first (FK requirement)
    await client.post("/properties", json={
        "yardi": "P777",
        "address": "777 Test St",
        "city": "Test City",
        "state": "CA",
        "zip": 12345
    })

    # 2. Upload a fake file
    file_content = io.BytesIO(b"fake image data")
    res = await client.post(
        "/property-photos/upload",
        files={"file": ("test.jpg", file_content, "image/jpeg")}
    )
    assert res.status_code == 201
    url = res.json()["url"]
    assert url.endswith("test.jpg")

    # 3. Add DB record linked to property
    res = await client.post(
        "/property-photos",
        data={"property_yardi": "P777", "photo_url": url, "caption": "front view"}
    )
    assert res.status_code == 200
    photo = res.json()
    assert photo["photo_url"] == url
    photo_id = photo["id"]

    # 4. Get photos for property
    res = await client.get("/property-photos/P777")
    assert res.status_code == 200
    photos = res.json()
    assert len(photos) == 1
    assert photos[0]["caption"] == "front view"

    # 5. Delete photo
    res = await client.delete(f"/property-photos/{photo_id}")
    assert res.status_code == 200
    assert res.json() == {"success": True}
