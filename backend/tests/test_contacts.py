import pytest

@pytest.mark.asyncio
async def test_contact_crud(client):
    contact_id = 1

    # Create
    res = await client.post("/contacts", json={
        "contact_id": contact_id,
        "name": "Jane Doe",
        "email": "jane@example.com"
    })
    assert res.status_code == 201

    # Update
    res = await client.put(f"/contacts/{contact_id}", json={"name": "Jane Updated"})
    assert res.status_code == 200
    updated = res.json()
    assert updated["name"] == "Jane Updated"

    # Delete
    res = await client.delete(f"/contacts/{contact_id}")
    assert res.status_code == 200

@pytest.mark.asyncio
async def test_update_nonexistent_contact(client):
    res = await client.put("/contacts/999", json={"name": "Ghost"})
    assert res.status_code == 404

@pytest.mark.asyncio
async def test_delete_nonexistent_contact(client):
    res = await client.delete("/contacts/999")
    assert res.status_code == 404
