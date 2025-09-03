import pytest

@pytest.mark.asyncio
async def test_code_crud(client):
    yardi = "P500"
    code_id = 40

    # Create property (FK requirement)
    await client.post("/properties", json={
        "yardi": yardi,
        "address": "3000 Cedar",
        "city": "Sacramento",
        "state": "CA",
        "zip": 95814
    })

    # Create code
    res = await client.post("/codes", json={
        "code_id": code_id,
        "property_yardi": yardi,
        "description": "Alarm Code",
        "code": "1234"
    })
    assert res.status_code == 201

    # Update
    res = await client.put(f"/codes/{code_id}", json={"code": "5678"})
    assert res.status_code == 200
    updated = res.json()["code"]  
    assert updated["code"] == "5678"

    # Delete
    res = await client.delete(f"/codes/{code_id}")
    assert res.status_code == 200
