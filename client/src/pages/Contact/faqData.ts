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


interface FaqItem {
  question:string;
  answer:string;
}

const faqData : FaqItem[] = [
    {
      question: "How quickly can I expect a response?",
      answer: "We typically respond to all inquiries within 24 hours during business days. For urgent matters, please use our phone support."
    },
    {
      question: "What are your support hours?",
      answer: "Our support team is available Monday through Friday, 9:00 AM to 6:00 PM EST. Online support tickets can be submitted 24/7."
    },
    {
      question: "Do you offer technical support on weekends?",
      answer: "Weekend support is available for premium members. Regular support requests submitted during weekends will be addressed on the next business day."
    },
    {
      question: "How can I schedule a demo?",
      answer: "You can schedule a demo by filling out the contact form or calling us directly. Please mention your preferred date and time in the message."
    }
  ];

  export default faqData;