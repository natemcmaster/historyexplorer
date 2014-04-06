from flask import Flask, request, g, redirect, url_for,\
 abort, render_template, flash, jsonify

import psycopg2
import os
import json
import exporter

app = Flask(__name__)
app.config['PROPAGATE_EXCEPTIONS'] = True

def open_db():
	return psycopg2.connect('dbname=wgraph user=nmcmaster')

@app.route('/')
def root():
	return app.send_static_file('index.html')

@app.route('/api/pair',methods=['POST'])
def pair():
	d=request.get_json()
	id_a=d['a']
	id_b=d['b']
	msg = 'Pairing %s <-> %s' % (id_a,id_b)
	with open_db() as conn:
		with conn.cursor() as cursor:
			try:
				cursor.execute('''insert into edges (node_from,node_to) 
			               		values(%s, %s)
				               ''',(id_a,id_b))
				cursor.execute('''insert into edges (node_from,node_to) 
			               		values(%s, %s)
				               ''',(id_b,id_a))
			except:
				return jsonify(status='Already added'),500
		conn.commit()
	exporter.writefile('../public/data.json')
	return msg,200


@app.route('/api/review',methods=['POST'])
def review():
	d=request.get_json()
	node_id=d['id']
	msg = 'Flagging needs review %s' % (node_id)
	with open_db() as conn:
		with conn.cursor() as cursor:
			try:
				cursor.execute('''update nodes set needs_review = 'true' where id = %s''',[node_id])

			except Exception as e:
				return jsonify(status='Error: ' + str(e)),500
		conn.commit()
	exporter.writefile('../public/data.json')
	return msg,200


@app.route('/api/add_image',methods=['POST'])
def images():
	d=request.get_json()
	id=d['id']
	url=d['url']
	size=d['size']
	msg = 'Adding image %s <-> %s' % (id,url)
	with open_db() as conn:
		with conn.cursor() as cursor:
			try:
				cursor.execute('''update nodes set image = %s ,image_size = %s where id = %s
				               ''',(url,size,id))
			except:
				return jsonify(status='Error'),500
		conn.commit()
	exporter.writefile('../public/data.json')
	return msg,200

@app.route('/api/edges',methods=['GET'])
def get_edges():
	edges=[]
	with open_db() as conn:
		with conn.cursor() as cursor:
			cursor.execute('select id,name,description,all_images,image,image_size from nodes order by name')
			edges = cursor.fetchall()

	edges = map(lambda x: {'id':x[0],'image':x[4],'title':x[1],'description':x[2],'image_size':x[5],'images':list(set(json.loads(x[3])))},edges)
	return jsonify(edges=edges)

if __name__ == "__main__":
    app.run()