import websocket


def on_message(ws, message):
    print message


def on_error(ws, error):
    print error


def on_close(ws):
    print "ws closed"


def on_open(ws):
    print "ws connected..."


if __name__ == "__main__":
    ws = websocket.WebSocketApp("ws://127.0.0.1:8080/positionBroadcaster",
                                on_message=on_message,
                                on_error=on_error,
                                on_close=on_close)
    ws.on_open = on_open
    ws.run_forever()
