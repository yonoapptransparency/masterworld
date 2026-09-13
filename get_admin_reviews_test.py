import urllib.request
import json

req = urllib.request.Request("http://0.0.0.0:3000/api/v1/public/community/reviews/spin-crush?limit=5")
with urllib.request.urlopen(req) as response:
    print("Public:", response.read().decode('utf-8'))
