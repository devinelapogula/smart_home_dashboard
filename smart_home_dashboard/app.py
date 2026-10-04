
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

devices = {
    "light": {
        "name": "Light",
        "icon": "💡",
        "status": "OFF"
    },
    "fan": {
        "name": "Fan",
        "icon": "🌀",
        "status": "OFF"
    },
    "ac": {
        "name": "AC",
        "icon": "❄️",
        "status": "OFF"
    }
}

scheduled_tasks = []
next_task_id = 1


@app.route("/")
def home():
    return render_template(
        "index.html",
        devices=devices,
        scheduled_tasks=scheduled_tasks
    )


@app.route("/api/device/<device>/<action>", methods=["POST"])
def change_device(device, action):

    if device not in devices:
        return jsonify({
            "success": False,
            "message": "Device not found"
        }), 404

    action = action.upper()

    if action not in ["ON", "OFF"]:
        return jsonify({
            "success": False,
            "message": "Invalid action"
        }), 400

    devices[device]["status"] = action

    return jsonify({
        "success": True,
        "device": device,
        "status": action
    })


@app.route("/api/schedule", methods=["POST"])
def add_schedule():

    global next_task_id

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "No data received"
        }), 400

    device = data.get("device")
    time_value = data.get("time")
    action = data.get("action")

    if device not in devices:
        return jsonify({
            "success": False,
            "message": "Invalid device"
        }), 400

    if not time_value:
        return jsonify({
            "success": False,
            "message": "Please select a time"
        }), 400

    if action not in ["ON", "OFF"]:
        return jsonify({
            "success": False,
            "message": "Invalid action"
        }), 400

    task = {
        "id": next_task_id,
        "device": devices[device]["name"],
        "device_key": device,
        "time": time_value,
        "action": action,
        "status": "SCHEDULED"
    }

    scheduled_tasks.append(task)

    next_task_id += 1

    return jsonify({
        "success": True,
        "task": task
    })


@app.route("/api/schedule/<int:task_id>", methods=["DELETE"])
def delete_schedule(task_id):

    global scheduled_tasks

    old_length = len(scheduled_tasks)

    scheduled_tasks = [
        task
        for task in scheduled_tasks
        if task["id"] != task_id
    ]

    if len(scheduled_tasks) == old_length:
        return jsonify({
            "success": False,
            "message": "Task not found"
        }), 404

    return jsonify({
        "success": True
    })


if __name__ == "__main__":
    app.run(debug=True)
