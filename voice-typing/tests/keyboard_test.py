import time
from pynput import keyboard

# Initialize state
recording = False
ctrl_pressed = False

def win32_event_filter(msg, data):
    global ctrl_pressed, recording

    # Key codes and messages
    VK_CONTROL = 0x11
    VK_LCONTROL = 0xA2
    VK_RCONTROL = 0xA3
    VK_CAPITAL = 0x14

    WM_KEYDOWN = 0x0100
    WM_KEYUP = 0x0101

    # Update Ctrl state for both left and right Ctrl keys
    if data.vkCode in (VK_CONTROL, VK_LCONTROL, VK_RCONTROL):
        if msg == WM_KEYDOWN:
            ctrl_pressed = True
        elif msg == WM_KEYUP:
            ctrl_pressed = False
        return True

    # Handle Caps Lock
    if data.vkCode == VK_CAPITAL and msg == WM_KEYDOWN:
        if ctrl_pressed:
            # Allow normal Caps Lock behavior when Ctrl is pressed
            return True
        else:
            # Toggle recording and suppress Caps Lock
            recording = not recording
            print(f"Recording {'started' if recording else 'stopped'}")
            listener.suppress_event()
            return False

    return True

listener = keyboard.Listener(
    win32_event_filter=win32_event_filter,
    suppress=False
)

if __name__ == "__main__":
    print("Starting keyboard shortcut test...")
    print("Press Caps Lock to toggle recording (Caps Lock state will not change)")
    print("Press Ctrl + Caps Lock to toggle Caps Lock state (Recording will not change)")
    print("Press Ctrl+C to exit")
    listener.start()
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        listener.stop()
        if recording:
            print("Stopping recording...")
            recording = False
        print("\nTest ended")
