import os
import mokkari
from flask_cors import CORS
from flaskext.mysql import MySQL
from flask import Flask, request

app = Flask(__name__)
CORS(app)

port_num=5011
app.config["mok_user"]=""
app.config["mok_pass"]=""
mysql = MySQL()
app.config['MYSQL_DATABASE_USER'] = ''
app.config['MYSQL_DATABASE_PASSWORD'] = ''
app.config['MYSQL_DATABASE_DB'] = ''
# app.config['MYSQL_DATABASE_DB'] = 'testComics'
app.config['MYSQL_DATABASE_HOST'] = ''
mysql.init_app(app)


@app.route("/loginThingy", methods = ['GET', 'POST', 'OPTIONS'] )
def loginThingy():
    if request.method == 'GET':    
        user= request.args.get('user')
        password= request.args.get('password')
        db= request.args.get('db')
        host= request.args.get('host')
        mok_username= request.args.get('mok_user')
    # try:
    # app.config['MYSQL_DATABASE_USER'] = user
    # app.config['MYSQL_DATABASE_PASSWORD'] = password
    # app.config['MYSQL_DATABASE_DB'] = db
    # app.config['MYSQL_DATABASE_HOST'] = host
    # app.config["mok_user"]=mok_username
    # app.config["mok_pass"]=password
        # mysql.init_app(app)
    return 'string'
    # except:
    #     return 'no'
    

@app.route("/logout", methods = ['GET', 'POST', 'OPTIONS'] )
def logout():
    app.config['MYSQL_DATABASE_USER'] = ""
    app.config['MYSQL_DATABASE_PASSWORD'] = ""
    app.config['MYSQL_DATABASE_DB'] = ""
    app.config['MYSQL_DATABASE_HOST'] = ""
    app.config["mok_user"]=""
    app.config["mok_pass"]=""
    return "asdfasdfasdf"

@app.route("/seriesList", methods = ['GET', 'POST', 'OPTIONS'] )
def getSeriesList():
    mydb = mysql.connect()
    mycursor = mydb.cursor()
    mycursor.execute(f"SELECT SeriesName FROM Series order by SeriesName")
    myresult = mycursor.fetchall()
    names=[]
    for i in myresult:
        names.append(i[0])
    mydb.close()
    return str(names)

@app.route("/pubList", methods = ['GET', 'POST', 'OPTIONS'] )
def getFlaskPubs():
    return str(getPubList())

@app.route("/seriesEntries", methods = ['GET', 'POST', 'OPTIONS'] )
def getSeriesEntries():
    if request.method == 'GET':
            series = request.args.get('seriesName')
    # return  seriesName
    seriesName=series.replace("\'","\\'")
    mydb = mysql.connect()
    mycursor = mydb.cursor()
    sql=f"SELECT e.issueName,e.DateString,i.coverURL FROM Entry e, RealIssue i WHERE i.SeriesName=e.SeriesName and i.IssueName=e.IssueName and e.SeriesName='{str(seriesName)}' order by DateString"
    mycursor.execute(sql)
    # mycursor.execute(f"SELECT issueName,DateString FROM Entry WHERE SeriesName='{str(seriesName)}' order by DateString")
    
    myresult = mycursor.fetchall()
    names=[]
    for li in myresult:
        listli=[]
        for i in li:
            listli.append(i)    
        if "\'" in listli[0]:
            listli[0]=listli[0].replace("\'","///")
        names.append((listli[0],str(listli[1]),listli[2]))
    mydb.close()
    return str(names)

@app.route("/dateEntries", methods = ['GET', 'POST', 'OPTIONS'] )
def getDateEntries():
    if request.method == 'GET':
            date = request.args.get('date')
    mydb = mysql.connect()
    mycursor = mydb.cursor()
    sql=f"SELECT e.issueName,e.SeriesName,i.coverURL,e.DateString FROM Entry e, RealIssue i WHERE i.SeriesName=e.SeriesName and i.IssueName=e.IssueName and DateString like \'{str(date)}%\' order by DateString"
    mycursor.execute(sql)
    # mycursor.execute(f"SELECT IssueName,SeriesName FROM Entry WHERE DateString like \'{str(date)}%\' order by DateString")
    myresult = mycursor.fetchall()
    names=[]
    for li in myresult:
        listli=[]
        for i in li:
            listli.append(i)    
        if "\'" in listli[0]:
            listli[0]=listli[0].replace("\'","///")
        names.append((listli[0],listli[1],listli[2],str(listli[3])))
    mydb.close()
    return str(names)

@app.route("/yearlyStats", methods = ['GET', 'POST', 'OPTIONS'] )
def tempTableYear():
    if request.method == 'GET':
        year= request.args.get('year')
    mydb=mysql.connect()
    totals=[]
    mycursor = mydb.cursor()
    sql=f"select COUNT(*) from RealIssue i, Entry e, Series s where e.IssueName=i.IssueName and e.SeriesName=i.SeriesName and i.SeriesName=s.SeriesName AND DateString like \'{year}%\';"
    mycursor.execute(sql)
    totals.append(mycursor.fetchall()[0][0])
    pub_list=getPubList()
    for i in pub_list:
        sql=f"select COUNT(*) from RealIssue i, Entry e, Series s where e.IssueName=i.IssueName and e.SeriesName=i.SeriesName and i.SeriesName=s.SeriesName and s.Publisher=\'{i}\' AND DateString like \'{year}%\';"
        mycursor.execute(sql)
        totals.append(mycursor.fetchall()[0][0])
    sql=f"select COUNT(*) from RealIssue i, Entry e, Series s where e.IssueName=i.IssueName and e.SeriesName=i.SeriesName and i.SeriesName=s.SeriesName and s.Xmen=\'1\' AND DateString like \'{year}%\';"
    mycursor.execute(sql)
    xmen=mycursor.fetchall()[0][0]
    sql=f"select COUNT(*) from RealIssue i, Entry e, Series s where e.IssueName=i.IssueName and e.SeriesName=i.SeriesName and i.SeriesName=s.SeriesName and i.XmenAdj=\'1\' AND DateString like \'{year}%\';"
    mycursor.execute(sql)
    xmen+=mycursor.fetchall()[0][0]
    totals.append(xmen)
    sql=f"select COUNT(Distinct i.`SeriesName`) from RealIssue i, Entry e, Series s where e.IssueName=i.IssueName and e.SeriesName=i.SeriesName and i.SeriesName=s.SeriesName AND DateString like \'{year}%\';"
    mycursor.execute(sql)
    totals.append(mycursor.fetchall()[0][0])
    return str(totals)

@app.route("/snapshotStats", methods = ['GET', 'POST', 'OPTIONS'] )
def getSnapshotStats():
    if request.method == 'GET':
        start= request.args.get('start')
        end= request.args.get('end')
    mydb=mysql.connect()
    totals=[]
    mycursor = mydb.cursor()
    sql=f"select COUNT(*) from RealIssue i, Entry e, Series s where e.IssueName=i.IssueName and e.SeriesName=i.SeriesName and i.SeriesName=s.SeriesName AND DateString<=\'{end} 23:59:59\' and DateString>=\'{start} 00:00:00\';"
    mycursor.execute(sql)
    totals.append(mycursor.fetchall()[0][0])
    pub_list=getPubList()
    for i in pub_list:
        sql=f"select COUNT(*) from RealIssue i, Entry e, Series s where e.IssueName=i.IssueName and e.SeriesName=i.SeriesName and i.SeriesName=s.SeriesName and s.Publisher=\'{i}\' AND DateString<=\'{end} 23:59:59\' and DateString>=\'{start} 00:00:00\';"
        mycursor.execute(sql)
        totals.append(mycursor.fetchall()[0][0])
    sql=f"select COUNT(*) from RealIssue i, Entry e, Series s where e.IssueName=i.IssueName and e.SeriesName=i.SeriesName and i.SeriesName=s.SeriesName and s.Xmen=\'1\' AND DateString<=\'{end} 23:59:59\' and DateString>=\'{start} 00:00:00\';"
    mycursor.execute(sql)
    xmen=mycursor.fetchall()[0][0]
    sql=f"select COUNT(*) from RealIssue i, Entry e, Series s where e.IssueName=i.IssueName and e.SeriesName=i.SeriesName and i.SeriesName=s.SeriesName and i.XmenAdj=\'1\' AND DateString<=\'{end} 23:59:59\' and DateString>=\'{start} 00:00:00\';"
    mycursor.execute(sql)
    xmen+=mycursor.fetchall()[0][0]
    totals.append(xmen)
    sql=f"select COUNT(Distinct i.`SeriesName`) from RealIssue i, Entry e, Series s where e.IssueName=i.IssueName and e.SeriesName=i.SeriesName and i.SeriesName=s.SeriesName AND DateString<=\'{end} 23:59:59\' and DateString>=\'{start} 00:00:00\';"
    mycursor.execute(sql)
    totals.append(mycursor.fetchall()[0][0])
    return str(totals)

@app.route("/monthlyStats", methods = ['GET', 'POST', 'OPTIONS'] )
def tempTableMonth():
    if request.method == 'GET':
        year= request.args.get('year')
        month= request.args.get('month')
    mydb=mysql.connect()
    totals=[]
    mycursor = mydb.cursor()
    sql=f"select COUNT(*) from RealIssue i, Entry e, Series s where e.IssueName=i.IssueName and e.SeriesName=i.SeriesName and i.SeriesName=s.SeriesName AND DateString like \'{year}-{month}%\';"
    mycursor.execute(sql)
    totals.append(mycursor.fetchall()[0][0])
    pub_list=getPubList()
    for i in pub_list:
        sql=f"select COUNT(*) from RealIssue i, Entry e, Series s where e.IssueName=i.IssueName and e.SeriesName=i.SeriesName and i.SeriesName=s.SeriesName AND s.Publisher=\'{i}\' AND DateString like \'{year}-{month}%\';"
        mycursor.execute(sql)
        totals.append(mycursor.fetchall()[0][0])
    sql=f"select COUNT(*) from RealIssue i, Entry e, Series s where e.IssueName=i.IssueName and e.SeriesName=i.SeriesName and i.SeriesName=s.SeriesName AND s.Xmen=1 AND DateString like \'{year}-{month}%\';"
    mycursor.execute(sql)
    xmen=mycursor.fetchall()[0][0]
    sql=f"select COUNT(*) from RealIssue i, Entry e, Series s where e.IssueName=i.IssueName and e.SeriesName=i.SeriesName and i.SeriesName=s.SeriesName AND i.XmenAdj=1 AND DateString like \'{year}-{month}%\';"
    mycursor.execute(sql)
    xmen+=mycursor.fetchall()[0][0]
    totals.append(xmen)
    sql=f"select COUNT(Distinct i.`SeriesName`) from RealIssue i, Entry e, Series s where e.IssueName=i.IssueName and e.SeriesName=i.SeriesName and i.SeriesName=s.SeriesName AND DateString like \'{year}-{month}%\';"
    mycursor.execute(sql)
    totals.append(mycursor.fetchall()[0][0])
    return str(totals)

@app.route("/overviewStats", methods = ['GET', 'POST', 'OPTIONS'] )
def overview():
    mydb=mysql.connect()
    totals=[]
    mycursor = mydb.cursor()
    sql=f"SELECT COUNT(*) FROM Entry;"
    mycursor.execute(sql)
    totals.append(mycursor.fetchall()[0][0])
    pub_list=getPubList()
    for i in pub_list:
        sql=f"select count(*) FROM Series s, Entry i where s.`SeriesName`=i.`SeriesName` and s.`Publisher`=\'{i}\';"
        mycursor.execute(sql)
        totals.append(mycursor.fetchall()[0][0])
    sql=f"select count(*) FROM Series s, Entry i where s.`SeriesName`=i.`SeriesName` and s.`Xmen`=1;"
    mycursor.execute(sql)
    xmen=mycursor.fetchall()[0][0]
    sql=f"select count(*) FROM Entry e, RealIssue i where e.SeriesName=i.SeriesName and e.IssueName=i.IssueName and i.`XmenAdj`=1;"
    mycursor.execute(sql)
    xmen+=mycursor.fetchall()[0][0]
    
    totals.append(xmen)
    sql="SELECT COUNT(*) FROM Series;"
    mycursor.execute(sql)
    totals.append(mycursor.fetchall()[0][0])
    return str(totals)

@app.route("/createSeries", methods = ['GET', 'POST', 'OPTIONS'] )
def createSeries():
    try:
        if request.method == 'GET':
            series=request.args.get('seriesName')
            publisher=request.args.get('publisher')
            xmen=request.args.get('xmen')
            seriesID=request.args.get('seriesID')
        # seriesName=getSeriesName(seriesID)
        seriesName=series.replace("\'","\\'")
        mydb = mysql.connect()
        mycursor = mydb.cursor()
        if seriesID=="None":
            sql=f"INSERT INTO Series(SeriesName, Publisher, xmen) VALUES(\'{seriesName}\', \'{publisher}\', {xmen});"
        else:
            sql=f"INSERT INTO Series(SeriesName, Publisher, xmen, seriesID) VALUES(\'{seriesName}\', \'{publisher}\', {xmen}, {seriesID} );"
        mycursor.execute(sql)
        mydb.commit()
        mydb.close()
        return series
    except:
        return sql
        # return "False"

@app.route("/getLastDateTime", methods = ['GET', 'POST', 'OPTIONS'] )
def getLastDateTime():
    if request.method == 'GET':
        dateString=request.args.get('dateString')
    mydb = mysql.connect()
    mycursor = mydb.cursor()        
    sql=f"SELECT max(DateString) as date FROM Entry where DateString like \'{dateString}%\';"
    mycursor.execute(sql)
    myresult=mycursor.fetchall()[0][0]
    mydb.close()
    return str(myresult)

@app.route("/addIssue", methods = ['GET', 'POST', 'OPTIONS'] )
def addIssue():
    newIssue=False
    # try:
    if request.method == 'GET':
        issue=request.args.get('issue')
        series=request.args.get('series')
        xmenBool=request.args.get('xmenAdj')
        if xmenBool=="false":
            xmenAdj=0
        elif xmenBool=='true':
            xmenAdj=1
        date=request.args.get('date')
    seriesName=series.replace("\'","\\'")
    issueName=issue.replace("\'","\\'")
    if not issueExists(issueName,seriesName):
        newIssue=True
        mydb = mysql.connect()
        mycursor=mydb.cursor()
        sql=f"insert into RealIssue(IssueName, SeriesName, XmenAdj) values(\'{issueName}\', \'{seriesName}\', \'{xmenAdj}\');"
        mycursor.execute(sql)
        mydb.commit()
        mycursor.close()
        mydb.close()
    searchDate=date.split(" ")[0]
    # return entryExists(issueName,series,searchDate)
    if not entryExists(issueName,seriesName,searchDate):
        mydb = mysql.connect()
        mycursor=mydb.cursor()
        sql=f"insert into Entry(IssueName, SeriesName, DateString) values(\'{issueName}\', \'{seriesName}\', \'{date}\');"
        mycursor.execute(sql)
        mydb.commit()
        mycursor.close()
        mydb.close()
        return f"{newIssue}"

@app.route("/addPublisher", methods = ['GET', 'POST', 'OPTIONS'] )
def addPublisher():
    try:
        if request.method == 'GET':
            publisher=request.args.get('publisher')
        mydb = mysql.connect()
        mycursor = mydb.cursor()        
        sql="SELECT MAX(list_order) as count FROM publisher;"
        mycursor.execute(sql)
        num=mycursor.fetchall()[0][0]
        mycursor.close()
        mycursor = mydb.cursor()        
        sql=f"insert into publisher(publisher, list_order) values(\'{publisher}\', {num+1});"
        mycursor.execute(sql)
        mydb.commit()
        mydb.close()
        return "True"
    except:
        return "False"

@app.route("/seriesAPI", methods = ['GET', 'POST', 'OPTIONS'] )
def seriesAPI():
    if request.method == 'GET':
        seriesName=request.args.get('seriesName')
        publisher=request.args.get('publisher')
        year=request.args.get('year')
    seriesID=None
    
    seriesID=getSeriesInfo(year,publisher,seriesName)
    # m = mokkari.api(mok_user, mok_pass)
    # seriesList=m.series_list({"year_began":year, "publisher":publisher})
    # for i in seriesList:
    #     if i.display_name==seriesName:
    #         seriesID=i.id
            
    if seriesID is not None:
        mydb = mysql.connect()
        mycursor=mydb.cursor()
        sql=f"UPDATE Series SET seriesID={seriesID} WHERE SeriesName=\"{seriesName}\""
        mycursor.execute(sql)
        mydb.commit()
        mycursor.close()
        mydb.close()
    return str(seriesID)

@app.route("/issueAPI", methods = ['GET', 'POST', 'OPTIONS'] )
def issueAPI():
    if request.method == 'GET':
        issue=request.args.get('issue')
        series=request.args.get('series')
        year=request.args.get('year')
    seriesID=None
    issueData=[]
    seriesName=series.replace("\'","\\'")
    status="getID"
    try:
        mydb = mysql.connect()
        mycursor = mydb.cursor()
        sql=f"SELECT seriesID FROM Series WHERE SeriesName=\'{seriesName}\'"
        mycursor.execute(sql)
        seriesID=mycursor.fetchall()[0][0]
        mydb.close()
        
        status="getPub"
        mydb = mysql.connect()
        mycursor = mydb.cursor()
        sql=f"SELECT Publisher FROM Series WHERE SeriesName=\'{seriesName}\'"
        mycursor.execute(sql)
        publisher=mycursor.fetchall()[0][0]
        mydb.close()
        
        if seriesID is None:
            status="getInfo"
            seriesID=getSeriesInfo(year,publisher,seriesName)
        
        mok_user=app.config['mok_user']
        mok_pass=app.config['mok_pass']
        
        if seriesID is not None:
            roles=["Writer","Colorist","Penciller","Inker","Artist","Story","Plot","Script"]
            writers=["Writer","Story","Plot","Script"]
            m = mokkari.api(mok_user, mok_pass)
            issueList=m.issues_list({"series_id":seriesID})
            for i in issueList:
                if i.number==str(issue):
                    metronIssue=m.issue(i.id)
                    status="putID"
                    addIssueID(issue,seriesName,metronIssue.id)
                    status="putCover"
                    addIssueCover(issue,seriesName,metronIssue.image)
                    # issueData.append(issue.id)
                    # issueData.append(issue.image)
                    for creators in metronIssue.credits:
                        for i in creators.role:
                            role=i.name
                            if role in roles:
                                if role in writers:
                                    role="Writer"
                                status=f"{role}"
                                status=f"{role}, success"
                                addIssueCreator(issue,seriesName,role,creators.creator)
                                issueData.append(f"{role}: {creators.creator}")
                                # print(f"{role}: {creators.creator}")
                        # role=creators.role[0].name
                        # if role in roles:
                        #     status=f"{role}"
                        #     status=f"{role}, success"
        
        return str(issueData)
    except:
        return status

@app.route("/selectSeries", methods = ['GET', 'POST', 'OPTIONS'] )
def getSeriesSelectList():
    if request.method == 'GET':
        name=request.args.get('seriesName')
        publisher=request.args.get('publisher')
        year=request.args.get('startYear')
    toRet=[]
    m = mokkari.api("wally_west2048", "Farticles12!")
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

@app.route("/getInfo", methods = ['GET', 'POST', 'OPTIONS'] )
def getInfo():
    if request.method == 'GET':
        issue=request.args.get('issue')
        series=request.args.get('series')
    names={}
    roles=["Color","Inker","Penciller","Writer","Artist"]
    mydb = mysql.connect()
    mycursor = mydb.cursor()        
    sql=f"SELECT {roles[0]},{roles[1]},{roles[2]},{roles[3]},{roles[4]} FROM RealIssue where issueName=\"{issue}\" and seriesName=\"{series}\";"
    mycursor.execute(sql)
    isRole=mycursor.fetchall()[0]
    mycursor.close()
    mycursor = mydb.cursor()        
    for i in range(len(roles)):
        if isRole[i]:
            roleName=roles[i]
            sql=f"select {roleName}Name from Issue{roleName} where issueName=\"{issue}\" and seriesName=\"{series}\""
            mycursor.execute(sql)
            myresult=mycursor.fetchall()
            if len(myresult)>0:
                names[roleName]=[]
                for x in myresult:
                    names[roleName].append(x[0])
    mydb.close()
    if len(names)>0:
        nameDict=str(names)
        nameDict=nameDict.replace("\'","")  
        nameDict=nameDict.replace("{","")  
        nameDict=nameDict.replace("}","")  
        return nameDict
    return ""

@app.route("/getURL", methods = ['GET', 'POST', 'OPTIONS'] )
def getURL():
    if request.method == 'GET':
        issue=request.args.get('issue')
        series=request.args.get('series')
    mydb = mysql.connect()
    mycursor = mydb.cursor()        
    sql=f"SELECT coverURL FROM RealIssue where issueName=\"{issue}\" and seriesName=\"{series}\";"
    mycursor.execute(sql)
    myresult=mycursor.fetchall()[0][0]
    mydb.close()
    return str(myresult)
    

######################################### HELPER FUNCTIONS #########################################

def issueExists(issue,series):
    mydb = mysql.connect()
    mycursor = mydb.cursor()
    sql=f"SELECT IssueName FROM RealIssue WHERE SeriesName=\'{series}\' AND issueName=\'{issue}\';"
    mycursor.execute(sql)
    myresult=mycursor.fetchall()
    mydb.close()
    if len(myresult)==0:
        return False
    else:
        return True

def entryExists(series,issue,date):
    mydb = mysql.connect()
    mycursor = mydb.cursor()
    sql=f"SELECT IssueName FROM Entry WHERE SeriesName=\'{series}\' AND issueName=\'{issue}\' AND dateString like \'{date}%\';"
    mycursor.execute(sql)
    myresult=mycursor.fetchall()
    mydb.close()
    if len(myresult)==0:
        return False
    else:
        return True

def getPubList():
    mydb = mysql.connect()
    mycursor = mydb.cursor()
    mycursor.execute(f"SELECT publisher from publisher order by list_order")
    myresult = mycursor.fetchall()
    names=[]
    for i in myresult:
        names.append(i[0])
    mydb.close()
    return names

def getSeriesInfo(year,pub,seriesName):
    mok_user=app.config['mok_user']
    mok_pass=app.config['mok_pass']
    m = mokkari.api(mok_user, mok_pass)
    seriesList=m.series_list({"year_began":year, "publisher":pub})
    for i in seriesList:
        if i.display_name==seriesName:
            return i.id
    return None

def getSeriesName(seriesID):
    mok_user=app.config['mok_user']
    mok_pass=app.config['mok_pass']
    m = mokkari.api(mok_user, mok_pass)
    series=m.series(seriesID)
    return f"{series.name} ({series.year_began})"

def addIssueID(issueName,seriesName,id):
    mydb = mysql.connect()
    mycursor=mydb.cursor()
    sql=f"UPDATE RealIssue SET issueID=\"{id}\" WHERE IssueName=\"{issueName}\" AND SeriesName=\"{seriesName}\""
    mycursor.execute(sql)
    mydb.commit()
    mycursor.close()
    mydb.close()
    
def addIssueCover(issueName,seriesName,url):
    mydb = mysql.connect()
    mycursor=mydb.cursor()
    sql=f"UPDATE RealIssue SET coverURL=\"{url}\" WHERE IssueName=\"{issueName}\" AND SeriesName=\"{seriesName}\""
    mycursor.execute(sql)
    mydb.commit()
    mycursor.close()
    mydb.close()
    
def addIssueCreator(issueName,seriesName,role,creator):
    try:
        status=f"put 1 in {role}"
        if role=="Colorist":
            role="Color"
        mydb = mysql.connect()
        mycursor=mydb.cursor()
        sql=f"UPDATE RealIssue SET {role}=1 WHERE IssueName=\"{issueName}\" AND SeriesName=\"{seriesName}\""
        mycursor.execute(sql)
        mydb.commit()
        mycursor.close()

        status=f'add to issue{role} table'
        mycursor=mydb.cursor()
        sql=f"INSERT INTO Issue{role}(IssueName,{role}Name,SeriesName) VALUES(\"{issueName}\",\"{creator}\",\"{seriesName}\")"
        mycursor.execute(sql)
        mydb.commit()
        mycursor.close()
        
        if not creatorExists(role,creator):
            status=f'add new {role}'
            mycursor=mydb.cursor()
            sql=f"INSERT INTO {role}({role}Name) VALUES(\"{creator}\")"
            mycursor.execute(sql)
            mydb.commit()
            mycursor.close()
        
        mydb.close()
        return "success"
    except:
        return status

def creatorExists(role,creator):
    mydb = mysql.connect()
    mycursor=mydb.cursor()
    sql=f"Select count(*) from {role} where {role}Name=\"{creator}\""
    mycursor.execute(sql)
    result=mycursor.fetchall()[0][0]
    mycursor.close()
    mydb.close()
    return result


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=port_num)