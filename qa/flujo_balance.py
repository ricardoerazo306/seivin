import sys; import os; sys.path.insert(0,os.path.dirname(__file__))
from playwright.sync_api import sync_playwright
import supabase_simulado as mock
W=int(sys.argv[1]); tag=sys.argv[2]
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--no-sandbox"])
    ctx=b.new_context(viewport={"width":W,"height":900},device_scale_factor=1)
    pg=ctx.new_page(); mock.install(ctx,pg)
    pg.on("pageerror",lambda e: errs.append(str(e)))
    pg.on("console",lambda m: errs.append(m.text) if m.type=="error" else None)
    base="http://localhost:4174"
    pg.goto(base+"/app/organiza"); pg.wait_for_selector("text=Empezar noviembre"); pg.screenshot(path=f"qa/capturas/{tag}-1-organiza.png",full_page=True)
    pg.get_by_role("button",name="Empezar noviembre").click()
    pg.wait_for_selector("text=Lo que salió"); pg.wait_for_timeout(500)
    # Cambiar mercado y salidas
    pg.get_by_label("Valor de Mercado").fill("620000"); pg.get_by_label("Valor de Mercado").blur()
    pg.get_by_label("Valor de Salidas").fill("380000"); pg.get_by_label("Valor de Salidas").blur()
    pg.get_by_label("Valor de Diseño freelance").fill("400000"); pg.get_by_label("Valor de Diseño freelance").blur()
    pg.get_by_label("Valor de Ropa").fill("160000"); pg.get_by_label("Valor de Ropa").blur()
    pg.get_by_role("button",name="Agregar gasto").click()
    f=pg.locator("form").last
    f.get_by_label("Categoría").select_option(label="Suscripciones"); f.get_by_label("Nombre (opcional)").fill("Streaming"); f.get_by_label("Valor").fill("45000")
    f.get_by_role("button",name="Agregar").click(); pg.wait_for_selector("text=Nuevo este mes"); pg.wait_for_timeout(600)
    pg.screenshot(path=f"qa/capturas/{tag}-2-editor.png",full_page=True)
    pg.get_by_role("button",name="Cerrar el balance").click(); pg.wait_for_selector("text=Así cerró noviembre"); pg.wait_for_timeout(500)
    pg.screenshot(path=f"qa/capturas/{tag}-3-cerrado.png",full_page=True)
    print(pg.locator("text=Así cerró noviembre").locator("..").inner_text()[:600])
    pg.goto(base+"/app/organiza/categorias"); pg.wait_for_selector("text=En qué sale"); pg.screenshot(path=f"qa/capturas/{tag}-4-categorias.png",full_page=True)
    b.close()
print("ERRORES:",errs or "ninguno")
