import http.client, urllib, base64, requests

headers = {
        'Content-Type':'application/json',
        'Ocp-Apim-Subscription-Key':'{ComputerVisionKey}'
        }
params = urllib.parse.urlencode({
    'language':'zh-Hant',
    'detectOrientation':'true'
    })
data = {
        'url':str(input())
        }
ocr_url = 'https://{ComputerVisionName}.cognitiveservices.azure.com/vision/v2.0/ocr'
try:
    response = requests.post(ocr_url, headers=headers, params=params, json=data)
    response.raise_for_status()
    analysis = response.json()
    print(analysis)
except Exception as e:
    print("[Error%s",e)
