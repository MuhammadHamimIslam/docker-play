const delete_btns = document.querySelectorAll(".delete-btn");
const task_completed = document.querySelectorAll(".task_completed");
const edit_btn = document.querySelectorAll(".edit-btn");
const csrf = document.querySelector('meta[name="csrf-token"]').content;
const headers = { "X-CSRFToken": csrf };
const form = document.querySelector("form");
const inputs = form.querySelectorAll("input.form-control");


const editId = document.getElementById("edit-id");
const editName = document.getElementById("edit-name");
const editTime = document.getElementById("edit-time");
const editError = document.getElementById("edit-error");
const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById("editModal"));

document.querySelectorAll(".edit-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    editId.value = btn.dataset.id;
    editName.value = btn.dataset.name;
    editTime.value = btn.dataset.time;
    editError.textContent = "";
  });
});

document.getElementById("save-edit").addEventListener("click", async () => {
  try {
    const res = await fetch(`/edit/${editId.value}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-CSRFToken": csrf },
      body: JSON.stringify({ task_name: editName.value, task_time: editTime.value }),
    });

    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { data = null; }

    if (!res.ok || !data) {
      editError.textContent = `Status ${res.status}: ${text.slice(0, 150)}`;
      return;
    }

    const btn = document.querySelector(`.edit-btn[data-id="${editId.value}"]`);
    const row = btn.closest("tr");
    row.cells[0].textContent = data.task_name;
    row.cells[1].textContent = data.task_time;
    btn.dataset.name = data.task_name;
    btn.dataset.time = editTime.value;
    modal.hide();
  } catch (err) {
    editError.textContent = "JS error: " + err.message;
  }
});


delete_btns.forEach(btn => {
  btn.addEventListener("click", async () => {
    try {
      const res = await fetch(`/delete/${btn.dataset.id}`, {
        method: 'DELETE',
        headers: headers
      });
      
      const row = btn.closest("tr");
      if (res.ok) {
        row.remove();
        if (!document.querySelector("tbody tr")) location.reload();
      }
    } catch (err) {
      console.log(err);
    }
  })
});

task_completed.forEach(checkbox => {
  checkbox.addEventListener('change', async e => {
    try {
      const res = await fetch(`/complete/${checkbox.dataset.id}`, {
        method: 'POST',
        headers: headers
      });
      if (res.ok) {
        checkbox.closest("tr").classList.add("table-success");
        checkbox.parentElement.textContent = 'Completed ✔️';
      }
    } catch (e) {
      console.log(e);
    }
  })
});

function validate(input) {
  const ok = input.checkValidity();
  input.classList.toggle("is-invalid", !ok);
  input.classList.toggle("is-valid", ok);
}

inputs.forEach(input => {
  // first check when leaving the field
  input.addEventListener("blur", () => validate(input));
  
  // after that, re-check on every keystroke
  input.addEventListener("input", () => {
    if (input.classList.contains("is-invalid") || input.classList.contains("is-valid")) {
      validate(input);
    }
  });
});

form.addEventListener("submit", e => {
  inputs.forEach(validate);
  if (!form.checkValidity()) e.preventDefault();
});