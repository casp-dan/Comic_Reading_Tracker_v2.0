## getartistentries
CREATE OR REPLACE FUNCTION public.getartistentries(creatorname text) RETURNS TABLE(issuename text, seriesname text, coverurl text, datestring timestamp with time zone) AS $$
BEGIN
RETURN QUERY
SELECT e."IssueName",e."SeriesName",i."coverURL",e."DateString" FROM public."Entry" e, public."RealIssue" i, public."IssueArtist" c WHERE c."ArtistName"=creatorname AND c."IssueName"=i."IssueName" AND i."IssueName"=e."IssueName" AND c."SeriesName"=i."SeriesName" AND i."SeriesName"=e."SeriesName" order by e."DateString";
END; 
\$$ LANGUAGE plpgsql;

## getcolorentries
CREATE OR REPLACE FUNCTION public.getcolorentries(creatorname text) RETURNS TABLE(issuename text, seriesname text, coverurl text, datestring timestamp with time zone) AS $$
BEGIN
RETURN QUERY
SELECT e."IssueName",e."SeriesName",i."coverURL",e."DateString" FROM public."Entry" e, public."RealIssue" i, public."IssueColor" c WHERE c."ColorName"=creatorname AND c."IssueName"=i."IssueName" AND i."IssueName"=e."IssueName" AND c."SeriesName"=i."SeriesName" AND i."SeriesName"=e."SeriesName" order by e."DateString";
END;
\$$ LANGUAGE plpgsql;

## getdateentries
CREATE OR REPLACE FUNCTION public.getdateentries(midnight timestamp with time zone, eod timestamp with time zone) RETURNS TABLE("IssueName" text, "SeriesName" text, "coverURL" text, "DateString" timestamp with time zone) AS $$
BEGIN
RETURN QUERY
SELECT e."IssueName", e."SeriesName", i."coverURL", e."DateString" FROM public."Entry" e, public."RealIssue" i WHERE i."SeriesName"=e."SeriesName" AND i."IssueName"=e."IssueName" AND e."DateString">=midnight and e."DateString"<=eod order by e."DateString";
END;
\$$ LANGUAGE plpgsql;

## getinkerentries
CREATE OR REPLACE FUNCTION public.getinkerentries(creatorname text) RETURNS TABLE(issuename text, seriesname text, coverurl text, datestring timestamp with time zone) AS $$
BEGIN
RETURN QUERY
SELECT e."IssueName",e."SeriesName",i."coverURL",e."DateString" FROM public."Entry" e, public."RealIssue" i, public."IssueInker" c WHERE c."InkerName"=creatorname AND c."IssueName"=i."IssueName" AND i."IssueName"=e."IssueName" AND c."SeriesName"=i."SeriesName" AND i."SeriesName"=e."SeriesName" order by e."DateString";
END;
\$$ LANGUAGE plpgsql;

## getlastdatetime
CREATE OR REPLACE FUNCTION public.getlastdatetime(midnight timestamp with time zone, eod timestamp with time zone) RETURNS TABLE(datestring timestamp with time zone) AS $$
BEGIN
RETURN QUERY
SELECT max("DateString") FROM public."Entry" where "DateString">=midnight and "DateString"<=eod;
END;
\$$ LANGUAGE plpgsql;

## getmonthpub
CREATE OR REPLACE FUNCTION public.getmonthpub(searchpub text, startmonth timestamp with time zone, endmonth timestamp with time zone) RETURNS SETOF bigint AS $$
BEGIN
RETURN QUERY
SELECT COUNT(*) FROM public."RealIssue" i, public."Entry" e, public."Series" s WHERE e."IssueName"=i."IssueName" AND e."SeriesName"=i."SeriesName" AND i."SeriesName"=s."SeriesName" AND s."Publisher"=searchpub AND  "DateString">=startmonth and "DateString"<=endmonth;
END;
\$$ LANGUAGE plpgsql;

## getmonthseries
CREATE OR REPLACE FUNCTION public.getmonthseries(startmonth timestamp with time zone, endmonth timestamp with time zone) RETURNS SETOF bigint AS $$
BEGIN
RETURN QUERY
SELECT COUNT(Distinct i."SeriesName") FROM public."RealIssue" i, public."Entry" e, public."Series" s WHERE e."IssueName"=i."IssueName" AND e."SeriesName"=i."SeriesName" AND i."SeriesName"=s."SeriesName" AND  "DateString">=startmonth and "DateString"<=endmonth;
END;
\$$ LANGUAGE plpgsql;

## getmonthtotal
CREATE OR REPLACE FUNCTION public.getmonthtotal(startmonth timestamp with time zone, endmonth timestamp with time zone) RETURNS SETOF bigint AS $$
BEGIN
RETURN QUERY
SELECT COUNT(*) FROM public."RealIssue" i, public."Entry" e, public."Series" s WHERE e."IssueName"=i."IssueName" AND e."SeriesName"=i."SeriesName" AND i."SeriesName"=s."SeriesName" AND  "DateString">=startmonth and "DateString"<=endmonth;
END;
\$$ LANGUAGE plpgsql;

## getmonthxmen
CREATE OR REPLACE FUNCTION public.getmonthxmen(startmonth timestamp with time zone, endmonth timestamp with time zone) RETURNS SETOF bigint AS $$
BEGIN
RETURN QUERY
SELECT COUNT(*) FROM public."RealIssue" i, public."Entry" e, public."Series" s WHERE e."IssueName"=i."IssueName" AND e."SeriesName"=i."SeriesName" AND i."SeriesName"=s."SeriesName" AND s."Xmen"=true AND  "DateString">=startmonth and "DateString"<=endmonth;
END;
\$$ LANGUAGE plpgsql;

## getmonthxmenadj
CREATE OR REPLACE FUNCTION public.getmonthxmenadj(startmonth timestamp with time zone, endmonth timestamp with time zone) RETURNS SETOF bigint AS $$
BEGIN
RETURN QUERY
SELECT COUNT(*) FROM public."RealIssue" i, public."Entry" e, public."Series" s WHERE e."IssueName"=i."IssueName" AND e."SeriesName"=i."SeriesName" AND i."SeriesName"=s."SeriesName" AND i."XmenAdj"=true AND  "DateString">=startmonth and "DateString"<=endmonth;
END;
\$$ LANGUAGE plpgsql;

## getoverpub
CREATE OR REPLACE FUNCTION public.getoverpub(searchpub text) RETURNS SETOF bigint AS $$
BEGIN
RETURN QUERY
SELECT count(*) FROM public."Series" s, public."Entry" i WHERE s."SeriesName"=i."SeriesName" AND s."Publisher"=searchpub;
END;
\$$ LANGUAGE plpgsql;

## getoverseries
CREATE OR REPLACE FUNCTION public.getoverseries(–) RETURNS SETOF bigint AS $$
BEGIN
RETURN QUERY
SELECT COUNT(*) FROM public."Series";
END;
\$$ LANGUAGE plpgsql;

## getovertotal
CREATE OR REPLACE FUNCTION public.getovertotal(–) RETURNS SETOF bigint AS $$
BEGIN
RETURN QUERY
SELECT COUNT(*) FROM public."Entry";
END;
\$$ LANGUAGE plpgsql;

## getoverxmen
CREATE OR REPLACE FUNCTION public.getoverxmen(–) RETURNS SETOF bigint AS $$
BEGIN
RETURN QUERY
SELECT count(*) FROM public."Series" s, public."Entry" i WHERE s."SeriesName"=i."SeriesName" AND s."Xmen"=true;
END;
\$$ LANGUAGE plpgsql;

## getoverxmenadj
CREATE OR REPLACE FUNCTION public.getoverxmenadj(–) RETURNS SETOF bigint AS $$
BEGIN
RETURN QUERY
SELECT count(*) FROM public."Entry" e, public."RealIssue" i WHERE e."SeriesName"=i."SeriesName" AND e."IssueName"=i."IssueName" AND i."XmenAdj"=true;
END;
\$$ LANGUAGE plpgsql;

## getpencillerentries
CREATE OR REPLACE FUNCTION public.getpencillerentries(creatorname text) RETURNS TABLE(issuename text, seriesname text, coverurl text, datestring timestamp with time zone) AS $$
BEGIN
RETURN QUERY
SELECT e."IssueName",e."SeriesName",i."coverURL",e."DateString" FROM public."Entry" e, public."RealIssue" i, public."IssuePenciller" c WHERE c."PencillerName"=creatorname AND c."IssueName"=i."IssueName" AND i."IssueName"=e."IssueName" AND c."SeriesName"=i."SeriesName" AND i."SeriesName"=e."SeriesName" order by e."DateString";
END;
\$$ LANGUAGE plpgsql;

## getseriesdrop
CREATE OR REPLACE FUNCTION public.getseriesdrop(–) RETURNS TABLE("SeriesName" text) AS $$
BEGIN
RETURN QUERY
SELECT "SeriesName" FROM public."Series" order by SeriesName;
END;
\$$ LANGUAGE plpgsql;

## getseriesentries
CREATE OR REPLACE FUNCTION public.getseriesentries(searchseries text) RETURNS TABLE("IssueName" text, "DateString" timestamp with time zone, "coverURL" text) AS $$
BEGIN
RETURN QUERY
SELECT e."IssueName", e."DateString", i."coverURL" FROM public."Entry" e, public."RealIssue" i WHERE i."SeriesName"=e."SeriesName" AND i."IssueName"=e."IssueName" AND e."SeriesName"=searchseries order by e."DateString";
END;
\$$ LANGUAGE plpgsql;

## getsnapshotpub
CREATE OR REPLACE FUNCTION public.getsnapshotpub(searchpub text, midnight timestamp with time zone, eod timestamp with time zone) RETURNS SETOF bigint AS $$
BEGIN
RETURN QUERY
SELECT COUNT(*) FROM public."RealIssue" i, public."Entry" e, public."Series" s WHERE e."IssueName"=i."IssueName" AND e."SeriesName"=i."SeriesName" AND i."SeriesName"=s."SeriesName" AND s."Publisher"=searchpub AND "DateString">=midnight and "DateString"<=eod;
END;
\$$ LANGUAGE plpgsql;

## getsnapshotseries
CREATE OR REPLACE FUNCTION public.getsnapshotseries(midnight timestamp with time zone, eod timestamp with time zone) RETURNS SETOF bigint AS $$
BEGIN
RETURN QUERY
SELECT COUNT(Distinct i."SeriesName") FROM public."RealIssue" i, public."Entry" e, public."Series" s WHERE e."IssueName"=i."IssueName" AND e."SeriesName"=i."SeriesName" AND i."SeriesName"=s."SeriesName" AND "DateString">=midnight and "DateString"<=eod;
END;
\$$ LANGUAGE plpgsql;

## getsnapshottotal
CREATE OR REPLACE FUNCTION public.getsnapshottotal(midnight timestamp with time zone, eod timestamp with time zone) RETURNS SETOF bigint AS $$
BEGIN
RETURN QUERY
SELECT COUNT(*) FROM public."RealIssue" i, public."Entry" e, public."Series" s WHERE e."IssueName"=i."IssueName" AND e."SeriesName"=i."SeriesName" AND i."SeriesName"=s."SeriesName" AND "DateString">=midnight and "DateString"<=eod;
END;
\$$ LANGUAGE plpgsql;

## getsnapshotxmen
CREATE OR REPLACE FUNCTION public.getsnapshotxmen(midnight timestamp with time zone, eod timestamp with time zone) RETURNS SETOF bigint AS $$
BEGIN
RETURN QUERY
SELECT COUNT(*) FROM public."RealIssue" i, public."Entry" e, public."Series" s WHERE e."IssueName"=i."IssueName" AND e."SeriesName"=i."SeriesName" AND i."SeriesName"=s."SeriesName" AND s."Xmen"=true AND "DateString">=midnight and "DateString"<=eod;
END;
\$$ LANGUAGE plpgsql;

## getsnapshotxmenadj
CREATE OR REPLACE FUNCTION public.getsnapshotxmenadj(midnight timestamp with time zone, eod timestamp with time zone) RETURNS SETOF bigint AS $$
BEGIN
RETURN QUERY
SELECT COUNT(*) FROM public."RealIssue" i, public."Entry" e, public."Series" s WHERE e."IssueName"=i."IssueName" AND e."SeriesName"=i."SeriesName" AND i."SeriesName"=s."SeriesName" AND i."XmenAdj"=true AND "DateString">=midnight and "DateString"<=eod;
END;
\$$ LANGUAGE plpgsql;

## gettest
CREATE OR REPLACE FUNCTION public.gettest(midnight timestamp with time zone, eod timestamp with time zone) RETURNS TABLE("IssueName" text, "SeriesName" text, coverurl text, datestring timestamp with time zone) AS $$
BEGIN
RETURN QUERY
SELECT e."IssueName",e."SeriesName",i."coverURL",e."DateString" FROM public."Entry" e, public."RealIssue" i WHERE i."SeriesName"=e."SeriesName" and i."IssueName"=e."IssueName" and "DateString">=midnight and "DateString"<=eod;
END;
\$$ LANGUAGE plpgsql;

## getwriterentries
CREATE OR REPLACE FUNCTION public.getwriterentries(creatorname text) RETURNS TABLE(issuename text, seriesname text, coverurl text, datestring timestamp with time zone) AS $$
BEGIN
RETURN QUERY
SELECT e."IssueName",e."SeriesName",i."coverURL",e."DateString" FROM public."Entry" e, public."RealIssue" i, public."IssueWriter" c WHERE c."WriterName"=creatorname AND c."IssueName"=i."IssueName" AND i."IssueName"=e."IssueName" AND c."SeriesName"=i."SeriesName" AND i."SeriesName"=e."SeriesName" order by e."DateString";
END;
\$$ LANGUAGE plpgsql;

## getyearpub
CREATE OR REPLACE FUNCTION public.getyearpub(searchpub text, newyear timestamp with time zone, nye timestamp with time zone) RETURNS SETOF bigint AS $$
BEGIN
RETURN QUERY
SELECT COUNT(*) FROM public."RealIssue" i, public."Entry" e, public."Series" s WHERE e."IssueName"=i."IssueName" AND e."SeriesName"=i."SeriesName" AND i."SeriesName"=s."SeriesName" AND s."Publisher"=searchpub AND "DateString">=newyear and "DateString"<=nye;
END;
\$$ LANGUAGE plpgsql;

## getyearseries
CREATE OR REPLACE FUNCTION public.getyearseries(newyear timestamp with time zone, nye timestamp with time zone) RETURNS SETOF bigint AS $$
BEGIN
RETURN QUERY
SELECT COUNT(Distinct i."SeriesName") FROM public."RealIssue" i, public."Entry" e, public."Series" s WHERE e."IssueName"=i."IssueName" AND e."SeriesName"=i."SeriesName" AND i."SeriesName"=s."SeriesName" AND "DateString">=newyear and "DateString"<=nye;
END;
\$$ LANGUAGE plpgsql;

## getyeartotal
CREATE OR REPLACE FUNCTION public.getyeartotal(newyear timestamp with time zone, nye timestamp with time zone) RETURNS SETOF bigint AS $$
BEGIN
RETURN QUERY
SELECT COUNT(*) FROM public."RealIssue" i, public."Entry" e, public."Series" s WHERE e."IssueName"=i."IssueName" AND e."SeriesName"=i."SeriesName" AND i."SeriesName"=s."SeriesName" AND "DateString">=newyear and "DateString"<=nye;
END;
\$$ LANGUAGE plpgsql;

## getyearxmen
CREATE OR REPLACE FUNCTION public.getyearxmen(newyear timestamp with time zone, nye timestamp with time zone) RETURNS SETOF bigint AS $$
BEGIN
RETURN QUERY
SELECT COUNT(*) FROM public."RealIssue" i, public."Entry" e, public."Series" s WHERE e."IssueName"=i."IssueName" AND e."SeriesName"=i."SeriesName" AND i."SeriesName"=s."SeriesName" AND s."Xmen"=true AND "DateString">=newyear and "DateString"<=nye;
END;
\$$ LANGUAGE plpgsql;

## getyearxmenadj
CREATE OR REPLACE FUNCTION public.getyearxmenadj(newyear timestamp with time zone, nye timestamp with time zone) RETURNS SETOF bigint AS $$
BEGIN
RETURN QUERY
SELECT COUNT(*) FROM public."RealIssue" i, public."Entry" e, public."Series" s WHERE e."IssueName"=i."IssueName" AND e."SeriesName"=i."SeriesName" AND i."SeriesName"=s."SeriesName" AND i."XmenAdj"=true AND "DateString">=newyear and "DateString"<=nye;
END;
\$$ LANGUAGE plpgsql;

## nextpubnum
CREATE OR REPLACE FUNCTION public.nextpubnum(–) RETURNS TABLE(list_order bigint) AS $$
BEGIN
RETURN QUERY
SELECT MAX(list_order) as count FROM publisher;
END;
\$$ LANGUAGE plpgsql;

## tempyear
CREATE OR REPLACE FUNCTION public.tempyear(searchissue text) RETURNS SETOF bigint AS $$
BEGIN
RETURN QUERY
select COUNT(*) from public."RealIssue" i where i."issuename"=searchissue;
END;
\$$ LANGUAGE plpgsql;

## getseries
CREATE OR REPLACE FUNCTION public.getseries(midnight timestamp with time zone, eod timestamp with time zone) RETURNS TABLE("SeriesName" text, "coverURL" text) AS $$
BEGIN
RETURN QUERY
SELECT distinct e."SeriesName", s."coverURL" FROM public."Entry" e, public."Series" s WHERE e."DateString">=midnight and e."DateString"<=eod and e."SeriesName"=s."SeriesName";
END;
\$$ LANGUAGE plpgsql;