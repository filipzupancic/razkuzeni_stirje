import subprocess
import json

obj = {
    'snow_perc': 30,
    'coordinates': [1, 2, 3, 4],
    'date': '2020-10-30'
}

j = json.dumps(obj)
j = j.encode('utf-8')
j = j.hex()

process = subprocess.Popen(['../blockchain/bitcoin-cli.exe', '-datadir=../blockchain/data', 'createrawtransaction', "[]", "{\"data\": \""+str(j)+"\"}"], stdout=subprocess.PIPE, encoding='utf8')
out, err = process.communicate()

out=out.strip()
# out = out.decode('ascii')

# print(out)

process = subprocess.Popen(['../blockchain/bitcoin-cli.exe', '-datadir=../blockchain/data', 'fundrawtransaction', out], stdout=subprocess.PIPE, encoding='utf8')
out, err = process.communicate()

out=out.strip()
json_o = json.loads(out)

hex_s = json_o['hex']
# print(out)

process = subprocess.Popen(['../blockchain/bitcoin-cli.exe', '-datadir=../blockchain/data', 'signrawtransaction', hex_s], stdout=subprocess.PIPE, encoding='utf8')
out, err = process.communicate()

out=out.strip()
json_o = json.loads(out)

hex_s = json_o['hex']

process = subprocess.Popen(['../blockchain/bitcoin-cli.exe', '-datadir=../blockchain/data', 'sendrawtransaction', hex_s], stdout=subprocess.PIPE, encoding='utf8')
out, err = process.communicate()

hexes_file = open('hexes.txt', 'a')
hexes_file.write(out)
hexes_file.close()
