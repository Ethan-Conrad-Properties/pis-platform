import pytest

@pytest.mark.asyncio
async def test_property_get_all(client):
    # create 2 properties
    await client.post("/properties", json={"yardi": "P100", "address": "123 Main", "city": "Sac", "state": "CA"})
    await client.post("/properties", json={"yardi": "P200", "address": "456 Oak", "city": "Sac", "state": "CA"})

    res = await client.get("/properties")
    assert res.status_code == 200
    data = res.json()["properties"]
    assert any(p["yardi"] == "P100" for p in data)
    assert any(p["yardi"] == "P200" for p in data)

@pytest.mark.asyncio    
async def test_property_crud(client):
    yardi = "P100"

    # Create
    res = await client.post("/properties", json={
        "yardi": yardi,
        "address": "123 Main",
        "city": "Sacramento",
        "state": "CA",
        "zip": 95814
    })
    assert res.status_code == 201

    # Verify via GET by ID
    res = await client.get(f"/properties/{yardi}")
    assert res.status_code == 200
    prop = res.json()
    assert prop["address"] == "123 Main"

    # Update
    res = await client.put(f"/properties/{yardi}", json={
        "address": "456 Oak",
        "city": "Sacramento",
        "state": "CA",
        "zip": 95814
    })
    assert res.status_code == 200
    updated = res.json()["property"]
    assert updated["address"] == "456 Oak"

