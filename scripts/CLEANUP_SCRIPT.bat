@echo off
echo ========================================
echo تنظيف الملفات غير الضرورية
echo ========================================
echo.

REM حذف ملفات JSON المؤقتة
echo حذف ملفات JSON المؤقتة...
if exist "Create_Payment_Session_Tool.json" del /Q "Create_Payment_Session_Tool.json"
if exist "Create_Payment_Session_Tool_FIXED.json" del /Q "Create_Payment_Session_Tool_FIXED.json"
if exist "Create_Payment_Session_Tool_AED.json" del /Q "Create_Payment_Session_Tool_AED.json"
if exist "Tool_JSON_الصحيح.json" del /Q "Tool_JSON_الصحيح.json"

REM حذف ملفات .md المؤقتة (تقارير الحالة القديمة)
echo حذف ملفات .md المؤقتة...
for %%f in (*_STATUS.md *_COMPLETE.md *_VERIFICATION.md *_FIXED.md *_REPORT.md) do (
    if exist "%%f" del /Q "%%f"
)

echo.
echo ========================================
echo تم التنظيف!
echo ========================================
echo.
pause


