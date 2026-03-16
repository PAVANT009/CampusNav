"use client";

import { useEffect, useState } from "react";
import { parseExcel } from "@/actions/uploadExcel";

type ExcelRow = Record<string, string | number | boolean | null>;

export default function Upload() {
  const [data, setData] = useState<ExcelRow[]>([]);
  useEffect(() => {
    console.log(data)
  },[data])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const res = await parseExcel(formData);

    if (res.success) {
      setData(res.data); 
    } else {
      alert(res.message);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="file" name="file" accept=".xlsx,.xls" required className="bg-primary rounded-md border-border"/>
      <button type="submit">Upload</button>
    </form>
  );
}
