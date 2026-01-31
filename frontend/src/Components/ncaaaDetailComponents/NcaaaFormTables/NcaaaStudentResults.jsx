import React, { useState } from "react";
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";
import Papa from "papaparse";
import { FaFileUpload } from "react-icons/fa";

/* -------------------- CONSTANTS -------------------- */

const INITIAL_DATA = [
   {
      id: "students",
      label: "Number of Students",
      aPlus: "",
      a: "",
      bPlus: "",
      b: "",
      cPlus: "",
      c: "",
      dPlus: "",
      d: "",
      f: "",
      denied: "",
      inProgress: "",
      incomplete: "",
      pass: "",
      fail: "",
      withdrawn: "",
   },
   {
      id: "percentage",
      label: "Percentage",
      aPlus: "",
      a: "",
      bPlus: "",
      b: "",
      cPlus: "",
      c: "",
      dPlus: "",
      d: "",
      f: "",
      denied: "",
      inProgress: "",
      incomplete: "",
      pass: "",
      fail: "",
      withdrawn: "",
   },
];

const REQUIRED_HEADERS = [
   "Field",
   "Ap",
   "A",
   "Bp",
   "B",
   "Cp",
   "C",
   "Dp",
   "D",
   "F",
   "DN",
   "IP",
   "IC",
   "Pass",
   "Fail",
   "W",
];

const REQUIRED_ROWS = ["Number of Students", "Percentage"];

const NcaaaStudentResults = () => {
   const [data, setData] = useState(INITIAL_DATA);
   const [comment, setComment] = useState("");

   const updateCell = (rowId, columnId, value) => {
      setData((prev) => prev.map((row) => (row.id === rowId ? { ...row, [columnId]: value } : row)));
   };

   /* -------------------- CSV VALIDATION -------------------- */

   const validateCsv = (rows) => {
      if (!rows || rows.length !== 2) throw new Error("CSV must contain exactly 2 rows.");

      const headers = Object.keys(rows[0]);

      if (headers.length !== REQUIRED_HEADERS.length) throw new Error("CSV contains extra or missing columns.");

      REQUIRED_HEADERS.forEach((h) => {
         if (!headers.includes(h)) throw new Error(`Missing column: ${h}`);
      });

      const fieldValues = rows.map((r) => r.Field);
      REQUIRED_ROWS.forEach((r) => {
         if (!fieldValues.includes(r)) throw new Error(`Missing required row: ${r}`);
      });
   };

   /* -------------------- CSV MAPPING -------------------- */

   const mapCsvRow = (row) => ({
      id: row.Field === "Number of Students" ? "students" : "percentage",
      label: row.Field,
      aPlus: Number(row.Ap),
      a: Number(row.A),
      bPlus: Number(row.Bp),
      b: Number(row.B),
      cPlus: Number(row.Cp),
      c: Number(row.C),
      dPlus: Number(row.Dp),
      d: Number(row.D),
      f: Number(row.F),
      denied: Number(row.DN),
      inProgress: Number(row.IP),
      incomplete: Number(row.IC),
      pass: Number(row.Pass),
      fail: Number(row.Fail),
      withdrawn: Number(row.W),
   });

   /* -------------------- CSV UPLOAD -------------------- */

   const handleCsvUpload = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      Papa.parse(file, {
         header: true,
         skipEmptyLines: true,
         complete: ({ data: rows }) => {
            try {
               validateCsv(rows);
               setData(rows.map(mapCsvRow));
               alert("CSV loaded successfully.");
            } catch (err) {
               alert(err.message);
            }
         },
         error: (err) => alert(err.message),
      });
   };

   /* -------------------- TABLE -------------------- */

   const columns = [
      {
         header: "-",
         columns: [
            {
               accessorKey: "label",
               header: "",
               cell: ({ getValue }) => <div className="px-3 py-2">{getValue()}</div>,
            },
         ],
      },
      {
         header: "Grades",
         columns: [
            { accessorKey: "aPlus", header: "A+" },
            { accessorKey: "a", header: "A" },
            { accessorKey: "bPlus", header: "B+" },
            { accessorKey: "b", header: "B" },
            { accessorKey: "cPlus", header: "C+" },
            { accessorKey: "c", header: "C" },
            { accessorKey: "dPlus", header: "D+" },
            { accessorKey: "d", header: "D" },
            { accessorKey: "f", header: "F" },
         ],
      },
      {
         header: "Status Distributions",
         columns: [
            { accessorKey: "denied", header: "Denied Entry" },
            { accessorKey: "inProgress", header: "In Progress" },
            { accessorKey: "incomplete", header: "Incomplete" },
            { accessorKey: "pass", header: "Pass" },
            { accessorKey: "fail", header: "Fail" },
            { accessorKey: "withdrawn", header: "Withdrawn" },
         ],
      },
   ];

   const table = useReactTable({
      data,
      columns,
      getCoreRowModel: getCoreRowModel(),
   });

   return (
      <>
         <div className="max-w-min overflow-x-auto">
            <table>
               <thead>
                  {table.getHeaderGroups().map((hg) => (
                     <tr key={hg.id}>
                        {hg.headers.map((h) => (
                           <th
                              key={h.id}
                              colSpan={h.colSpan}
                              className="bg-green-700 text-white px-4 py-3 text-sm font-semibold border border-black/20">
                              {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                           </th>
                        ))}
                     </tr>
                  ))}
               </thead>
               <tbody>
                  {table.getRowModel().rows.map((row) => (
                     <tr key={row.id} className="bg-green-200">
                        {row.getVisibleCells().map((cell) => (
                           <td key={cell.id} className="border border-black/20">
                              {cell.column.id === "label" ? (
                                 flexRender(cell.column.columnDef.cell, cell.getContext())
                              ) : (
                                 <input
                                    value={cell.getValue()}
                                    onChange={(e) => updateCell(row.original.id, cell.column.id, e.target.value)}
                                    className="w-full px-2 py-3 focus:outline-none focus:ring-2 focus:ring-green-800"
                                 />
                              )}
                           </td>
                        ))}
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>

         <div className="flex my-4 gap-4">
            <input
               className="min-w-[300px] resize  max-w-[300px] min-h-fulle max-h-full border border-emerald-800 rounded-xl px-4 py-3"
               value={comment}
               onChange={(e) => setComment(e.target.value)}
               placeholder="Comments"
            />

            <div className="flex gap-4">
               <label className="flex items-center gap-3 px-4 py-3 bg-emerald-950 border border-emerald-800 rounded-lg cursor-pointer">
                  <FaFileUpload className="text-emerald-500 text-xl" />
                  <span className="text-emerald-100 font-medium">Upload CSV File</span>
                  <input type="file" accept=".csv" hidden onChange={handleCsvUpload} />
               </label>
            </div>
         </div>

         <button
            type="button"
            onClick={() => {
               console.log("Submitted Table Data:", data);
               console.log("Submitted Comments:", comment);
            }}
            className="
                        mt-8 cursor-pointer w-full max-w-xs
                        flex items-center justify-center gap-2
                        bg-green-700 text-white font-bold uppercase tracking-widest
                        px-8 py-3 rounded-lg
                        border-b-4 border-green-900
                        hover:bg-green-600
                        active:border-b-0 active:translate-y-1
                        transition-all duration-100
                        shadow-md
                     ">
            Submit Data
            <svg
               className="w-5 h-5 transition-transform group-hover:translate-x-1"
               fill="none"
               viewBox="0 0 24 24"
               stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
         </button>
      </>
   );
};

export default NcaaaStudentResults;
