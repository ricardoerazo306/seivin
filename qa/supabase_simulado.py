"""API simulada de Supabase para revisar pantallas sin cuentas reales."""
import json, re, uuid, time
from urllib.parse import urlparse, parse_qs

UID = "11111111-1111-4111-8111-111111111111"
def cid(): return str(uuid.uuid4())

CATS = []
for i,(n,k,e) in enumerate([("Salario","ingreso",False),("Negocios","ingreso",False),("Trabajos adicionales","ingreso",False),("Otros ingresos","ingreso",False),
  ("Vivienda","gasto",True),("Alimentación","gasto",True),("Transporte","gasto",True),("Servicios","gasto",True),("Educación","gasto",True),("Salud","gasto",True),("Deudas","gasto",True),
  ("Compras","gasto",False),("Entretenimiento","gasto",False),("Salidas","gasto",False),("Suscripciones","gasto",False),("Otros","gasto",False)]):
    CATS.append(dict(id=cid(),name=n,kind=k,is_essential=e,is_system=True,archived=False,sort_order=i))
C = {c["name"]:c["id"] for c in CATS}
BAL = [dict(id=cid(),period="2026-10-01",status="cerrado",closed_at="2026-11-01T10:00:00Z",note=None)]
LINES = []
def line(b,kind,cat,name,amount,et=None):
    LINES.append(dict(id=cid(),balance_id=b,kind=kind,category_id=C[cat],name=name,amount=amount,expense_type=et,line_date=None,description=None,recurring_item_id=None,source="manual",created_at=time.time()+len(LINES)))
b=BAL[0]["id"]
for k,c,n,a,e in [("ingreso","Salario","Salario",2800000,None),("ingreso","Trabajos adicionales","Diseño freelance",250000,None),("gasto","Vivienda","Arriendo",950000,"fijo"),
  ("gasto","Alimentación","Mercado",580000,"variable"),("gasto","Transporte","Transmilenio",160000,"fijo"),("gasto","Servicios","Luz, agua e internet",210000,"fijo"),("gasto","Salidas","Salidas",300000,"variable"),("gasto","Compras","Ropa",230000,"ocasional")]:
    line(b,k,c,n,a,e)
PROFILE = dict(id=UID,display_name="Ana",country="CO",currency="COP",locale="es-CO",theme="light",experience_mode="intermedio",priority=None,income_stability=None,dependents=0,capsules_read=[],onboarding_completed=True,plan="gratuito",created_at="2026-10-02T00:00:00Z")

def summaries():
    out=[]
    for b in BAL:
        ls=[l for l in LINES if l["balance_id"]==b["id"]]
        inc=sum(l["amount"] for l in ls if l["kind"]=="ingreso"); exp=sum(l["amount"] for l in ls if l["kind"]=="gasto")
        ess=sum(l["amount"] for l in ls if l["kind"]=="gasto" and next(c for c in CATS if c["id"]==l["category_id"])["is_essential"])
        out.append(dict(balance_id=b["id"],period=b["period"],status=b["status"],income_total=inc,expense_total=exp,essential_total=ess,left_total=inc-exp))
    return sorted(out,key=lambda r:r["period"],reverse=True)

def filt(rows,q):
    for k,v in q.items():
        if k in ("select","order","limit"): continue
        val=v[0]
        if val.startswith("eq."): rows=[r for r in rows if str(r.get(k))==val[3:]]
    return rows

def session():
    return dict(access_token="x.y.z",refresh_token="r",token_type="bearer",expires_in=360000,expires_at=int(time.time())+360000,
                user=dict(id=UID,email="ana@ejemplo.co",aud="authenticated",role="authenticated",user_metadata={"full_name":"Ana"},app_metadata={},created_at="2026-10-02T00:00:00Z"))

def handle(route, request):
    u=urlparse(request.url); q=parse_qs(u.query); path=u.path; m=request.method
    obj="vnd.pgrst.object" in (request.headers.get("accept") or "")
    def ok(data,status=200):
        if obj and isinstance(data,list): data=data[0] if data else None
        route.fulfill(status=status,content_type="application/json",body=json.dumps(data) if data is not None else "",headers={"access-control-allow-origin":"*"})
    if m=="OPTIONS": return route.fulfill(status=200,headers={"access-control-allow-origin":"*","access-control-allow-headers":"*","access-control-allow-methods":"*"})
    if path.startswith("/auth/v1/user"): return ok(session()["user"])
    if path.startswith("/auth/v1/health"): return ok({"name":"GoTrue"})
    if path.startswith("/auth/v1/logout"): return route.fulfill(status=204)
    t=path.split("/rest/v1/")[-1]
    body=json.loads(request.post_data) if request.post_data else None
    if t=="rpc/start_balance":
        p=body["p_period"]; ex=next((x for x in BAL if x["period"]==p),None)
        if ex: return ok(ex["id"])
        nb=dict(id=cid(),period=p,status="borrador",closed_at=None,note=None); BAL.append(nb)
        prev=sorted([x for x in BAL if x["period"]<p],key=lambda x:x["period"],reverse=True)
        if prev:
            for l in [l for l in LINES if l["balance_id"]==prev[0]["id"]]:
                LINES.append({**l,"id":cid(),"balance_id":nb["id"],"created_at":time.time()+len(LINES)})
        return ok(nb["id"])
    table={"categories":CATS,"monthly_balances":BAL,"balance_lines":LINES,"profiles":[PROFILE]}.get(t)
    if t=="balance_summaries": return ok(filt(summaries(),q))
    if table is None: return ok([])
    if m=="GET":
        rows=filt(table,q)
        if t=="balance_lines": rows=sorted(rows,key=lambda r:r["created_at"])
        return ok(rows)
    if m=="POST":
        items=body if isinstance(body,list) else [body]
        for it in items:
            it={**it,"id":cid(),"created_at":time.time()+len(table)}
            if t=="balance_lines": it.setdefault("expense_type",None); it.update(line_date=None,description=None,recurring_item_id=None,source="manual")
            if t=="categories": it.update(is_system=False,archived=False)
            table.append(it)
        return ok(items,201)
    if m=="PATCH":
        rows=filt(table,q)
        for r in rows: r.update(body)
        return ok(rows)
    if m=="DELETE":
        for r in filt(table,q): table.remove(r)
        return route.fulfill(status=204)
    ok([])

def install(context, page):
    context.route(re.compile(r"https://.*\.supabase\.co/.*"), handle)
    s=json.dumps(session())
    page.add_init_script(f"localStorage.setItem('sb-zhyyaglmjvyxdfoagwfp-auth-token', {json.dumps(s)}); localStorage.setItem('seivin:tema','light');")
