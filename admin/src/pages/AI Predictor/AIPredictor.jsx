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
  Button,
  Badge,
} from "../../shared/ui";

const AIPredictor = () => {
  const [marks, setMarks] = useState("");
  const [attendance, setAttendance] = useState("");
  const [branch, setBranch] = useState("");
  const [prediction, setPrediction] = useState("");
  const [loading, setLoading] = useState(false);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${backendUrl}/api/v9/aiPredictor`, {
        marks,
        attendance,
        branch,
      });

      if (response.data.success) {
        toast.success("Prediction successful!");
        setPrediction(response.data.prediction.result);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-admin-slate-50/60 py-6 sm:py-10 px-3 sm:px-6 lg:px-8 flex flex-col items-center justify-start">
      <div className="w-full max-w-md">
        <Card padding="default" className="shadow-admin-sm">
          <CardHeader
            title="AI Performance Predictor"
            subtitle="Forecast student academic outcomes based on marks and attendance"
          />

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              label="Student Marks"
              id="predictor-marks"
              required
              hint="Enter score or cumulative percentage"
            >
              <TextInput
                id="predictor-marks"
                type="number"
                value={marks}
                onChange={(e) => setMarks(e.target.value)}
                required
                placeholder="e.g., 85"
              />
            </FormField>

            <FormField
              label="Attendance Rate (%)"
              id="predictor-attendance"
              required
              hint="Percentage of classes attended"
            >
              <TextInput
                id="predictor-attendance"
                type="number"
                value={attendance}
                onChange={(e) => setAttendance(e.target.value)}
                required
                placeholder="e.g., 90"
              />
            </FormField>

            <FormField
              label="Department / Branch"
              id="predictor-branch"
              required
            >
              <TextInput
                id="predictor-branch"
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                required
                placeholder="e.g., Computer Science"
              />
            </FormField>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={loading}
                className="w-full"
              >
                {loading ? "Calculating Prediction..." : "Predict Outcome"}
              </Button>
            </div>
          </form>

          {prediction && (
            <div className="mt-6 p-4 bg-admin-emerald-50 border border-admin-emerald-200/80 rounded-xl">
              <div className="flex items-center justify-between mb-1.5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-admin-emerald-800">
                  Prediction Result
                </h3>
                <Badge tone="success" size="sm">
                  Computed
                </Badge>
              </div>
              <p className="text-sm text-admin-emerald-900 font-medium leading-relaxed">
                {prediction}
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

const WrappedAIPredictor = AppLayout()(AIPredictor);
export default WrappedAIPredictor;
