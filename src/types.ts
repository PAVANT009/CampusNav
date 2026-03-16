type ExcelRow = Record<string, string | number | boolean | null>;

type ParseExcelResponse =
  | { success: true; data: ExcelRow[] }
  | { success: false; message: string };
