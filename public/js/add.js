const placeForm = document.getElementById("place-form");
const placeId = document.getElementById("place-id");
const placeAddress = document.getElementById("place-address");

// send data to api
async function addPlace(e) {
  e.preventDefault();
  const data = {
    storeId: placeId.value,
    address: placeAddress.value
  };
  try {
    const res = await fetch("/api/v1/stores", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    if (res.status === 400) {
      throw Error("Try With another Place Id !");
    }
    alert("Place Added !");
    window.location.href = "/index.html";
  } catch (error) {
    alert(error);
    return;
  }
}
placeForm.addEventListener("submit", addPlace);
