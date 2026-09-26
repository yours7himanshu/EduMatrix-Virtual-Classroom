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

import { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import AppLayout from "../../layout/AppLayout";
import {
  Card,
  CardHeader,
  FormField,
  TextInput,
  Select,
  Button,
} from "../../shared/ui";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const RegistrarStudent = () => {
  const [rollNo, setRollNo] = useState("");
  const [name, setName] = useState("");
  const [branch, setBranch] = useState("");
  const [fees, setFees] = useState("");
  const [feesStatus, setFeesStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        `${backendUrl}/api/v8/student-fees-data`,
        {
          RollNumber: rollNo,
          Name: name,
          Fees: fees,
          Branch: branch,
          Fees_status: feesStatus,
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setRollNo("");
        setName("");
        setFees("");
        setFeesStatus("");
        setBranch("");
      }
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-admin-slate-50/60 py-6 sm:py-10 px-3 sm:px-6 lg:px-8 flex flex-col items-center justify-start">
      <div className="max-w-2xl w-full">
        <Card padding="default" className="shadow-admin-sm">
          <CardHeader
            title="Student Fees Record"
            subtitle="Register and manage student fee payment status and institutional billing"
          />

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <FormField
                label="Student Full Name"
                id="fees-student-name"
                required
              >
                <TextInput
                  id="fees-student-name"
                  type="text"
                  placeholder="Enter Student Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </FormField>

              <FormField
                label="Roll Number"
                id="fees-roll-number"
              >
                <TextInput
                  id="fees-roll-number"
                  type="number"
                  placeholder="Enter Student Roll Number"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                />
              </FormField>

              <FormField
                label="Tuition / Fees Amount (₹)"
                id="fees-amount"
                required
                hint="Total fee amount billed"
              >
                <TextInput
                  id="fees-amount"
                  type="number"
                  placeholder="Enter Student Fees"
                  value={fees}
                  onChange={(e) => setFees(e.target.value)}
                  required
                />
              </FormField>

              <FormField
                label="Branch / Department"
                id="fees-branch"
                required
              >
                <TextInput
                  id="fees-branch"
                  type="text"
                  placeholder="Enter Student Branch"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  required
                />
              </FormField>

              <div className="sm:col-span-2">
                <FormField
                  label="Payment Status"
                  id="fees-status"
                  required
                >
                  <Select
                    id="fees-status"
                    value={feesStatus}
                    onChange={(e) => setFeesStatus(e.target.value)}
                    required
                  >
                    <option value="">Select Fees Status</option>
                    <option value="Paid">Paid</option>
                    <option value="Unpaid">Unpaid</option>
                  </Select>
                </FormField>
              </div>
            </div>

            <div className="pt-2 border-t border-admin-slate-100">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={loading}
                className="w-full"
              >
                {loading ? "Recording Fees..." : "Submit Fee Record"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

const WrappedRegistrarStudent = AppLayout()(RegistrarStudent);
export default WrappedRegistrarStudent;