
function changeDevice(device, action) {

    fetch("/api/device/" + device + "/" + action, {
        method: "POST"
    })

    .then(function(response) {

        if (!response.ok) {
            throw new Error("Server error");
        }

        return response.json();

    })

    .then(function(data) {

        if (data.success) {

            var statusElement =
                document.getElementById("status-" + device);

            if (statusElement) {

                statusElement.textContent = data.status;

                statusElement.classList.remove("on");
                statusElement.classList.remove("off");

                if (data.status === "ON") {
                    statusElement.classList.add("on");
                } else {
                    statusElement.classList.add("off");
                }
            }

            showMessage(
                getDeviceName(device) +
                " turned " +
                data.status
            );

        } else {

            showMessage(data.message, true);
        }

    })

    .catch(function(error) {

        console.error(error);

        showMessage(
            "Unable to connect to Flask server.",
            true
        );

    });
}


function getDeviceName(device) {

    if (device === "light") {
        return "Light";
    }

    if (device === "fan") {
        return "Fan";
    }

    if (device === "ac") {
        return "AC";
    }

    return "Device";
}


function addSchedule() {

    var device =
        document.getElementById("device").value;

    var time =
        document.getElementById("time").value;

    var action =
        document.getElementById("action").value;


    if (time === "") {

        showMessage(
            "Please select a time.",
            true
        );

        return;
    }


    fetch("/api/schedule", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            device: device,
            time: time,
            action: action
        })

    })

    .then(function(response) {

        if (!response.ok) {
            throw new Error("Schedule error");
        }

        return response.json();

    })

    .then(function(data) {

        if (data.success) {

            addTaskToPage(data.task);

            document.getElementById("time").value = "";

            showMessage(
                "Schedule added successfully."
            );

        } else {

            showMessage(
                data.message,
                true
            );
        }

    })

    .catch(function(error) {

        console.error(error);

        showMessage(
            "Unable to add schedule.",
            true
        );

    });
}


function addTaskToPage(task) {

    var tasks =
        document.getElementById("tasks");

    var emptyState =
        document.getElementById("emptyState");


    if (emptyState) {
        emptyState.remove();
    }


    var row =
        document.createElement("div");

    row.className = "task-row";

    row.id = "task-" + task.id;


    row.innerHTML =

        "<div class='task-info'>" +

            "<strong>" +
                getDeviceName(task.device_key) +
            "</strong>" +

            "<span>" +
                task.time +
            "</span>" +

        "</div>" +

        "<div class='task-action'>" +
            task.action +
        "</div>" +

        "<div class='task-status'>" +
            task.status +
        "</div>" +

        "<button " +
            "type='button' " +
            "class='delete-btn' " +
            "onclick='deleteSchedule(" +
                task.id +
            ")'>" +

            "Delete" +

        "</button>";


    tasks.appendChild(row);
}


function deleteSchedule(id) {

    fetch("/api/schedule/" + id, {
        method: "DELETE"
    })

    .then(function(response) {

        if (!response.ok) {
            throw new Error("Delete error");
        }

        return response.json();

    })

    .then(function(data) {

        if (data.success) {

            var task =
                document.getElementById("task-" + id);

            if (task) {
                task.remove();
            }


            var tasks =
                document.getElementById("tasks");

            if (
                tasks &&
                tasks.querySelectorAll(".task-row").length === 0
            ) {

                var empty =
                    document.createElement("div");

                empty.id = "emptyState";

                empty.className = "empty-state";

                empty.textContent =
                    "No scheduled tasks yet. Add one above.";

                tasks.appendChild(empty);
            }

            showMessage(
                "Schedule deleted."
            );
        }

    })

    .catch(function(error) {

        console.error(error);

        showMessage(
            "Unable to delete schedule.",
            true
        );

    });
}


function showMessage(text, isError) {

    var message =
        document.getElementById("message");

    if (!message) {
        return;
    }


    message.textContent = text;


    if (isError) {
        message.className = "message error";
    } else {
        message.className = "message success";
    }


    setTimeout(function() {

        message.textContent = "";
        message.className = "message";

    }, 3000);
}

