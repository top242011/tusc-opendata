# Admin Data Import Guide

## Supported File Formats

### 1. Project Proposal (PDF)
- **Format**: Standard PDF document
- **Requirements**: Contains "Principles and Rationale", "Objectives", "Budget"
- **AI Processing**: Automatically extracts project name, advisor, rationale, objectives, and budget details.

### 2. Master List (Excel/CSV)
- **Format**: `.xlsx`, `.xls`, or `.csv`
- **Columns Required**:
  - `Organization` (Column A)
  - `Project Name` (Column B)
  - `Budget Requested` (Column C)
  - `Budget Approved` (Column D)
  - `Notes` (Optional)
- **Usage**: Use as a master validation list.

### 3. Archive (ZIP)
- **Format**: `.zip`
- **Usage**: Can contain multiple PDFs and one Master Excel file.
- **Behavior**: System automatically matches PDFs with the Master List based on project names.

## Import Workflow

1. **Select Campus**: Choose the target campus (Central, Rangsit, Tha Prachan, Lampang).
2. **Upload Files**: Drag & drop your ZIP, PDFs, or Excel files.
3. **Review**: Check the "Workbench" area for status:
   - ✅ **LINKED**: PDF matches entry in Master List.
   - 🆕 **NEW**: New project found in PDF or Excel.
   - ⚠️ **CONFLICT/WARNING**: Budget mismatch or missing info.
4. **Import**: Click "Save" to commit changes to the database.
