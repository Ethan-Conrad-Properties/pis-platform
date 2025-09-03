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

    # Update
    res = await client.put(f"/services/{service_id}", json={"vendor": "BetterClean"})
    assert res.status_code == 200
    updated = res.json()["service"]  # ✅ match your API response
    assert updated["vendor"] == "BetterClean"

    # Delete
    res = await client.delete(f"/services/{service_id}")
    assert res.status_code == 200
