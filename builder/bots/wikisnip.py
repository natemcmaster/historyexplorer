import urllib, sys, requests

def firstline(title):
    t = urllib.quote(title)
    query="http://en.wikipedia.org/w/api.php?action=query&prop=extracts&exsentences=10&redirects&format=json&explaintext&titles=%s" % t
    data = requests.get(query).json()
    for k in data['query']['pages']:
        d =data['query']['pages'][k]
        if 'extract' in d and 'title' in d: 
            return (d['title'],d['extract'])
    return (None,None)

def geturl(title):
    t = urllib.quote(title)
    query="http://en.wikipedia.org/w/api.php?format=json&redirects&action=query&prop=info&inprop=url&titles=%s" % t
    data=requests.get(query).json()
    for k in data['query']['pages']:
        d =data['query']['pages'][k]
        if 'fullurl' in d:
            return d['fullurl']
    return None

if __name__ == '__main__':
    arg= ' '.join(sys.argv[1:])
    firstline(arg)
