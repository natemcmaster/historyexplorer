import psycopg2, json
import sys
import psycopg2.extras
conn = psycopg2.connect('dbname=wgraph user=nmcmaster')
def export():
	out = {'links':{},'nodes':{}}
	with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
		cursor.execute('select id,name as title,description,image_size,image,source,sourceurl as url from nodes where needs_review = false')
		for row in cursor:
			out['nodes'][row['id']] = row
		cursor.execute('select node_to,node_from from edges join nodes on nodes.id=node_from where nodes.needs_review = false')
		for row in cursor:
			if not row['node_from'] in out['links']:	
				out['links'][row['node_from']]=[]
			out['links'][row['node_from']].append(row['node_to'])
	todel=[]
	for key in out['nodes']:
		if not key in out['links']:
			todel.append(key)

	for i in todel:
		del out['nodes'][i]
	return out

def writefile(filename):
	with open(filename,'w') as f:
		f.write(json.dumps(export()))

if __name__ == '__main__':
	writefile(sys.argv[1])