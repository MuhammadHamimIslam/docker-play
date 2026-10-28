const delete_btns = document.querySelectorAll(".delete-btn");
const task_completed = document.querySelectorAll(".task_completed");
const csrf = document.querySelector('meta[name="csrf-token"]').content;
const headers = { "X-CSRFToken": csrf };

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

const form = document.querySelector("form");
const inputs = form.querySelectorAll("input.form-control");

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