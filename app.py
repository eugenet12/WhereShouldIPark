import json
import pickle
import urllib2
from flask import Flask, request, redirect, render_template, make_response

app = Flask(__name__)

final_idx = pickle.load(open('final_idx', 'rb'))
locations_idx = pickle.load(open('locations_idx', 'rb'))

TIMES = ['12AM', '12:30AM', '1AM', '1:30AM', '2AM', '2:30AM', '3AM', '3:30AM', '4AM', '4:30AM', '5AM',
'5:30AM', '6AM', '6:30AM', '7AM', '7:30AM', '8AM', '8:30AM', '9AM', '9:30AM', '10AM', '10:30AM', '11AM',
'11:30AM', '12PM', '12:30PM', '1PM', '1:30PM', '2PM', '2:30PM', '3PM', '3:30PM', '4PM', '4:30PM', '5PM',
'5:30PM', '6PM', '6:30PM', '7PM', '7:30PM', '8PM', '8:30PM', '9PM', '9:30PM', '10PM', '10:30PM', '11PM',
'11:30PM']

CITY = 'new+york+city'

DEFAULT_COORDS = [40.7833, 73.9667]

def get_coord(st):
    streets = '+'.join(st.split())
    url = "http://maps.googleapis.com/maps/api/geocode/json?address=%s,+%s&sensor=false" % (streets, CITY)
    resp = urllib2.urlopen(url).read()
    resp_json = json.loads(resp)
    print resp_json
    loc = resp_json['results'][0]['geometry']['location']
    return loc['lat'], loc['lng']


@app.route('/')
def home():
    return render_template('index.html')

@app.route('/coord/', methods=['POST'])
def coord():
    form = request.json
    location = form['location']
    return json.dumps(get_coord(location))

@app.route('/locations/', methods=['POST'])
def main():
    form = request.json
    start = form['start']
    end = form['end']
    day = form['day']
    print start, day
    start_idx = TIMES.index(start)
    end_idx = TIMES.index(end)
    if start_idx > end_idx:
        trange = TIMES[end_idx:] + TIMES[:start_idx]
    else:
        trange = TIMES[start_idx:end_idx]

    #print "P-344848" in final_idx[("MON","8AM")]
    #print "S-324884" in final_idx[("MON","8AM")]
    #print "S-324884" in final_idx[("MON","11:30AM")]
    ids = set.intersection(*[final_idx[(day, t)] for t in trange])
    #print "S-324884" in ids
    locations = [locations_idx[id] for id in ids if id in locations_idx]
    print len(ids), len(locations)
    return json.dumps(locations)


if __name__=='__main__':
    app.run(debug=True)
