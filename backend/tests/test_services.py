import pytest

@pytest.mark.asyncio
async def test_service_crud(client):
    yardi = "P200"
    service_id = 10

    # Create property (FK requirement)
    await client.post("/properties", json={
        "yardi": yardi,
        "address": "999 Elm",
        "city": "Sacramento",
        "state": "CA",
        "zip": 95814
    })

    # Create service
    res = await client.post("/services", json={
        "service_id": service_id,
        "property_yardi": yardi,
        "service_type": "Janitorial",
        "vendor": "CleanCo"
    })
    assert res.status_code == 201

    # Get services for property
    res = await client.get("/services", params={"property_yardi": "P200"})
    assert res.status_code == 200
    assert any(s["service_id"] == service_id for s in res.json())

    # Update
    res = await client.put(f"/services/{service_id}", json={"vendor": "BetterClean"})
    assert res.status_code == 200
    updated = res.json()["service"]  
    assert updated["vendor"] == "BetterClean"

    # Delete
    res = await client.delete(f"/services/{service_id}")
    assert res.status_code == 200

@pytest.mark.asyncio
async def test_update_nonexistent_service(client):
    res = await client.put("/services/999", json={"vendor": "GhostVendor"})
    assert res.status_code == 404

@pytest.mark.asyncio
async def test_delete_nonexistent_service(client):
    res = await client.delete("/services/999")
    assert res.status_code == 404
