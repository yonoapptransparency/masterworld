import urllib.request, json
req = urllib.request.Request('http://0.0.0.0:3000/api/health')
try:
    with urllib.request.urlopen(req) as response:
        print(response.read().decode())
except Exception as e:
    print('Error:', e)
