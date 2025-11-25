import os
import mokkari
from flask_cors import CORS
from flaskext.mysql import MySQL
from flask import Flask, request, jsonify

app = Flask(__name__)
CORS(app)

port_num=5000
app.config["mok_user"]=""
app.config["mok_pass"]=""
mysql = MySQL()
app.config['PASSWORD'] = ''
mysql.init_app(app)


@app.route("/loginThingy", methods = ['GET', 'POST', 'OPTIONS'] )
def loginThingy():
    if request.method == 'GET':    
        password= request.args.get('password')
        userPass= request.args.get('userPass')
        mok_password= request.args.get('mok_password')
        mok_username= request.args.get('mok_user')
    try:
        app.config["mok_user"]=mok_username
        app.config["mok_pass"]=mok_password
        if userPass==password:
            return 'string'
        else:
            return 'no'
    except BaseException as e:
        return e

@app.route("/logout", methods = ['GET', 'POST', 'OPTIONS'] )
def logout():
    app.config['MYSQL_DATABASE_USER'] = ""
    app.config['MYSQL_DATABASE_PASSWORD'] = ""
    app.config['MYSQL_DATABASE_DB'] = ""
    app.config['MYSQL_DATABASE_HOST'] = ""
    app.config["mok_user"]=""
    app.config["mok_pass"]=""
    return "asdfasdfasdf"

@app.route("/seriesAPI", methods = ['GET', 'POST', 'OPTIONS'] )
def seriesAPI():
    if request.method == 'GET':
        seriesName=request.args.get('seriesName')
        publisher=request.args.get('publisher')
        year=request.args.get('year')
    seriesID=None
    
    seriesID=getSeriesInfo(year,publisher,seriesName)
    return str(seriesID)

@app.route("/issueAPI", methods = ['GET', 'POST', 'OPTIONS'] )
def issueAPI():
    if request.method == 'GET':
        issue=request.args.get('issue')
        seriesID=request.args.get('seriesID')
    mok_user=app.config['mok_user']
    mok_pass=app.config['mok_pass']
    m = mokkari.api(mok_user, mok_pass)
    issueList=m.issues_list({"series_id":int(seriesID)})
    coverURL=''
    for i in issueList:
        if i.number==str(issue):
            metronIssue=m.issue(i.id)
            issueID=i.id
            coverURL=str(metronIssue.image)
            roleDict={"Writer":[],"Colorist":[],"Penciller":[],"Inker":[],"Artist":[]}
            roles=["Writer","Colorist","Penciller","Inker","Artist","Story","Plot","Script"]
            writers=["Writer","Story","Plot","Script"]
            for creators in metronIssue.credits:
                for i in creators.role:
                    role=i.name
                    if role in roles:
                        if role in writers:
                            role="Writer"
                        roleDict[str(role)].append(str(creators.creator))
            info={"issueID":issueID,"coverURL":coverURL,"Writer":roleDict['Writer'],"Colorist":roleDict['Colorist'],"Penciller":roleDict['Penciller'],"Inker":roleDict['Inker'],"Artist":roleDict['Artist']}
            return jsonify(info)

@app.route("/selectSeries", methods = ['GET', 'POST', 'OPTIONS'] )
def getSeriesSelectList():
    if request.method == 'GET':
        name=request.args.get('seriesName')
        publisher=request.args.get('publisher')
        year=request.args.get('startYear')
    toRet=[]
    mok_user=app.config['mok_user']
    mok_pass=app.config['mok_pass']
    m = mokkari.api(mok_user, mok_pass)    
    if year=="":
        series=m.series_list({"name": name, "publisher":publisher})
    else:
        series=m.series_list({"name": name, "publisher":publisher, "year_began":year})
    for i in series:
        x=m.issues_list({"series_id":i.id})
        toRet.append([str(i.display_name),str(x[0].image),str(i.id)])
    return str(toRet)

@app.route("/getTrueName", methods = ['GET', 'POST', 'OPTIONS'] )
def getTrueSeriesName():
    if request.method == 'GET':
        seriesID=request.args.get('seriesID')
    mok_user=app.config['mok_user']
    mok_pass=app.config['mok_pass']
    
    m = mokkari.api(mok_user, mok_pass)
    series=m.series(seriesID)
    return f"{series.name} ({series.year_began})"

app.route("/getSeriesInfo", methods = ['GET', 'POST', 'OPTIONS'] )
def getSeriesInfo(year,pub,seriesName):
    if request.method == 'GET':
        year=request.args.get('year')
        pub=request.args.get('pub')
        seriesName=request.args.get('seriesName')
    mok_user=app.config['mok_user']
    mok_pass=app.config['mok_pass']
    m = mokkari.api(mok_user, mok_pass)
    seriesList=m.series_list({"year_began":year, "publisher":pub})
    for i in seriesList:
        if i.display_name==seriesName:
            return i.id
    return None

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=port_num)