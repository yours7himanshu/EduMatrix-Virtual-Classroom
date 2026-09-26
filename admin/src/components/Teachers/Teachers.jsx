/*

Copyright 2024 Himanshu Dinkar

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Badge,
  SkeletonTable,
  EmptyState,
} from "../../shared/ui";

function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${backendUrl}/api/v4/teacher-detail`,
          {
            withCredentials: true,
          }
        );
        if (response.data.success) {
          setTeachers(response.data.teacherDetail || []);
        }
      } catch (error) {
        console.log("Some error occurred", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, [backendUrl]);

  return (
    <div className="w-full my-2">
      {loading ? (
        <>
          <div className="hidden md:block">
            <SkeletonTable rows={4} cols={4} />
          </div>
          <div className="md:hidden space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white p-4 rounded-xl shadow-admin-xs border border-admin-slate-200/80 motion-safe:animate-pulse space-y-2.5"
              >
                <div className="flex justify-between items-center">
                  <div className="h-4 w-32 bg-admin-slate-200 rounded" />
                  <div className="h-4 w-16 bg-admin-slate-100 rounded-full" />
                </div>
                <div className="h-3 w-44 bg-admin-slate-100 rounded" />
              </div>
            ))}
          </div>
        </>
      ) : teachers.length === 0 ? (
        <EmptyState
          title="No teachers registered yet"
          description="Faculty members added through the Add Teacher portal will appear here."
        />
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {teachers.map((teacher, index) => (
              <div
                key={teacher._id || index}
                className="bg-white p-4 rounded-xl shadow-admin-xs border border-admin-slate-200/80 flex flex-col gap-2 transition hover:shadow-admin-sm"
              >
                <div className="flex justify-between items-start gap-2">
                  <h4 className="font-bold text-admin-slate-900 text-base">
                    {teacher.name}
                  </h4>
                  <Badge tone="brand" size="sm">
                    {teacher.experience} yrs exp
                  </Badge>
                </div>
                <div className="text-xs sm:text-sm text-admin-slate-600 flex flex-col gap-1.5 pt-2 border-t border-admin-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-admin-slate-400">Subject</span>
                    <span className="font-medium text-admin-slate-800">
                      {teacher.subject}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-admin-slate-400">Qualification</span>
                    <span className="text-admin-slate-700">
                      {teacher.qualification}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop/Tablet Table View */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Teacher Name</TableHead>
                  <TableHead>Qualifications</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Experience</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teachers.map((teacher, index) => (
                  <TableRow key={teacher._id || index}>
                    <TableCell className="font-semibold text-admin-slate-900">
                      {teacher.name}
                    </TableCell>
                    <TableCell className="text-admin-slate-600">
                      {teacher.qualification}
                    </TableCell>
                    <TableCell className="font-medium text-admin-slate-800">
                      {teacher.subject}
                    </TableCell>
                    <TableCell>
                      <Badge tone="brand" size="sm">
                        {teacher.experience} years
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}

export default Teachers;
