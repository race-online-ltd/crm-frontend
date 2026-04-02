// Components.jsx
import React, { useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";

// ================= MUI =================
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
// import Grid from "@mui/material/Unstable_Grid2";
import Grid from "@mui/material/Grid";

// ================= Icons =================
import DeleteIcon from "@mui/icons-material/Delete";
import SendIcon from "@mui/icons-material/Send";
import SaveIcon from "@mui/icons-material/Save";
// SimpleCard new Icons
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import GroupsIcon from '@mui/icons-material/Groups';
import PeopleIcon from '@mui/icons-material/People';
import TimelineIcon from '@mui/icons-material/Timeline';
import AdsClickIcon from '@mui/icons-material/AdsClick';
import { TbCoinTakaFilled } from "react-icons/tb";
// More icons
import GroupIcon from '@mui/icons-material/Group';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrackChangesIcon from '@mui/icons-material/TrackChanges'; // for “target/goal”
// import TargetIcon from '@mui/icons-material/Target';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CancelIcon from '@mui/icons-material/Cancel';
// import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import FileUploadModal from '../components/shared/FileUploadModal';



// ================= Shared Components =================
import AppDrawer from "../components/shared/AppDrawer";
import TextInputField from "../components/shared/TextInputField";
import PasswordField from "../components/shared/PasswordField";
import TextAreaInputField from "../components/shared/TextAreaInputField";
import NumberInputField from "../components/shared/NumberInputField";
import AmountInputField from "../components/shared/AmountInputField";
import DatePickerField from "../components/shared/DatePickerField";
import DateRangePickerField from "../components/shared/DateRangePickerField";
import SelectDropdownSingle from "../components/shared/SelectDropdownSingle";
import SelectDropdownMultiple from "../components/shared/SelectDropdownMultiple";
import FilterButton from "../components/shared/FilterButton";
import ExportCSVButton from "../components/shared/ExportCSVButton";
import BaseTable from "../components/shared/BaseTable";
import CommonTable from "../components/shared/CommonTable";
import KanbanCard from "../components/shared/KanbanCard";
import StatCard from "../components/shared/StatCard";
import SimpleCard from "../components/shared/SimpleCard"; 
import CustomToggle from '../components/shared/CustomToggle'; // Cutom Toggle
// Tiptap Editor
import RichTextEditor from "../components/shared/RichTextEditor";
import TextField from "@mui/material/TextField"; 
import RichTextRenderer from "../components/shared/RichTextRenderer";


// ================= Dummy Data =================
import { columns, rows, salesBoardData, productOptions } from "../dummy/data";
import { Comcolumns, Comrows } from "../dummy/commonData";
import ChartComponents from "./ChartPage/ChartComponents";
import TaskCalendar from "../features/task/components/TaskCalendar";


export default function Components() {

  const [modalOpen, setModalOpen] = useState(false);
// State to hold editor content
  const [editorContent, setEditorContent] = useState(null);

  const handleFinalUpload = (uploadedFiles) => {
    console.log("Final Files to API:", uploadedFiles);
    // এখানে আপনার API কল করতে পারেন
  };

  const dashboardStats = [
    { title: "Total KAMs", value: "5", icon: <GroupIcon />, iconBg: "#eef2ff", iconColor: "#4f46e5", footerLabel: "Active accounts", footerValue: "5 active" },
    { title: "Pipeline Value (Current Month)", value: "৳0", icon: <TrendingUpIcon />, iconBg: "#eff6ff", iconColor: "#3b82f6", footerLabel: "Last month", footerValue: "৳0" },
    { title: "Active Leads", value: "4", icon: <TrackChangesIcon />, iconBg: "#fff7ed", iconColor: "#f97316", footerLabel: "In progress", footerValue: "4 leads" },
    { title: "Won Leads (Current Month)", value: "0 (৳0)", icon: <EmojiEventsIcon />, iconBg: "#f0fdf4", iconColor: "#22c55e", footerLabel: "Last month", footerValue: "0 (৳0)" },
    { title: "Lost Leads (Current Month)", value: "0 (৳0)", icon: <CancelIcon />, iconBg: "#fef2f2", iconColor: "#ef4444", footerLabel: "Last month", footerValue: "0 (৳0)" },
  ];


  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerType, setDrawerType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [salesData, setSalesData] = useState(salesBoardData);

//   const initialValues = {
//   productSingle: "", // SelectDropdownSingle এর value
// };

// const validationSchema = Yup.object({
//   productSingle: Yup.number().required("Product is required"),
// });

  const openDrawer = (type) => {
    setDrawerType(type);
    setDrawerOpen(true);
  };

  const handleLoading = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  // ১. কলামের লিস্ট তৈরি করুন
const myColumns = [
  { id: 'kamName', label: 'KAM Name' },
  { id: 'target', label: 'Target' },
  { id: 'achievement', label: 'Achievement' },
  { id: 'totalInvSum', label: 'Inv. Sum' },
  { id: 'totalTarget', label: 'Total Target' },
  { id: 'totalAch', label: 'Total Ach (%)' },
];

// ২. স্যাম্পল ডেটা (Rows) তৈরি করুন
const myData = [
  { kamName: 'Rahim Ahmed', target: 50000, achievement: 45000, totalInvSum: 45000, totalTarget: 50000, totalAch: '90%' },
  { kamName: 'Suman Ali', target: 60000, achievement: 66000, totalInvSum: 66000, totalTarget: 60000, totalAch: '110%' },
];

  return (
    <Box
      sx={{
      minHeight: "100vh",
      width: "100%", // নিশ্চিত করুন এটি ফুল উইডথ
      maxWidth: "100vw", // স্ক্রিনের বাইরে যাবে না
      overflowX: "hidden", // সাইড স্ক্রল বন্ধ করবে
      p: { xs: 2, md: 4 }, // মোবাইল ও ডেস্কটপে আলাদা প্যাডিং
      display: "flex",
      flexDirection: "column",
      gap: 6,
      backgroundColor: "#f8fafc",
  }}
    >
      {/* ================= HEADER ================= */}
      <Typography variant="h4" fontWeight={600}>
        Components Showcase
      </Typography>
      {/* ================= STAT CARD (Dashboard Style) ================= */}
      <Typography variant="h6" fontWeight={400}>
        Stat Card Design (Dashboard Style)
      </Typography>

      <Box
        sx={{
          display: "grid",
          gap: 2,
          mb: 4,
          gridTemplateColumns: {
            xs: "1fr",                  // 1 column on mobile
            sm: "repeat(2, 1fr)",       // 2 columns on small tablets
            md: "repeat(3, 1fr)",       // 3 columns on desktops/tablets
            lg: "repeat(5, 1fr)",       // 5 columns on large screens
          },
        }}
      >
        {dashboardStats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </Box>

      {/* ================= Simple Card ================= */}
      <Typography variant="h6" color="initial" fontWeight={400}>Simple Card Design</Typography>
      <Grid container spacing={3}>
        {/* কার্ড ১: Total Branch */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <SimpleCard 
            title="Total Branch" 
            value="67" 
            icon={AccountTreeIcon} 
            iconColor="#6366f1" 
          />
        </Grid>

        {/* কার্ড ২: Total KAM */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <SimpleCard 
            title="Total KAM" 
            value="30" 
            icon={GroupsIcon} 
            iconColor="#10b981" 
          />
        </Grid>

        {/* কার্ড ৩: Total Clients */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <SimpleCard 
            title="Total Clients" 
            value="455" 
            icon={PeopleIcon} 
            iconColor="#3b82f6" 
          />
        </Grid>

        {/* কার্ড ৪: Avg Activities */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <SimpleCard 
            title="Avg Activities / KAM" 
            subtitle="Feb 2026"
            value="0.03" 
            icon={TimelineIcon} 
            iconColor="#f59e0b" 
          />
        </Grid>

        {/* কার্ড ৫: Target */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <SimpleCard 
            title="Target" 
            subtitle="Feb 2026"
            value="92,50,000" 
            icon={AdsClickIcon} 
            iconColor="#ec4899" 
          />
        </Grid>

        {/* কার্ড ৬: Achieved */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <SimpleCard 
            title="Achieved" 
            subtitle="Feb 2026"
            value="-27,87,628" 
            percentage="-30.14%"
            icon={TbCoinTakaFilled}
            iconSize={30}       // 🔥 bigger icon
            iconBoxSize={52}    // 🔥 bigger icon box
            iconColor="#06b6d4"
          />
        </Grid>
      </Grid>


      {/* ================= File Upload ================= */}
      <Typography variant="h6" color="initial" fontWeight={400}>File Upload Modal</Typography>
      <Button
        variant="contained"
        startIcon={<FileUploadIcon />}
        onClick={() => setModalOpen(true)}
      >
        Upload files
      </Button>

      <FileUploadModal 
        open={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onUpload={handleFinalUpload}
      />


      {/* ================= ACTION BUTTONS ================= */}
      <Stack direction="row" spacing={2} flexWrap="wrap">
        <Button variant="contained" onClick={() => openDrawer("form")}>
          Add New Lead
        </Button>

        <Button variant="outlined" onClick={() => openDrawer("filter")}>
          Filter Leads
        </Button>

        <FilterButton onClick={() => openDrawer("filter")} />

        <ExportCSVButton 
          rows={rows}        // correct prop name
          columns={columns}  // required columns prop
          filename="sales-report" // exact prop name
        />

      </Stack>

      {/* ================= Custom Toggle ================= */}
      <Stack spacing={3} sx={{ p: 4 }}>
        <CustomToggle size="xl" label="Extra Large" defaultChecked />
        <CustomToggle size="lg" label="Large" />
        <CustomToggle size="md" label="Medium" defaultChecked />
      </Stack>

      {/* ================= DRAWER ================= */}
      <AppDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={drawerType === "form" ? "Add New Lead" : "Filter Pipeline"}
        width={drawerType === "form" ? 500 : 350}
      >
        {drawerType === "form" && (
          <Formik
            initialValues={{
              leadName: "",
              password: "",
              description: "",
              total: "",
              amount: "",
              // productSingle: "",
              productMulti: [],
              range: [null, null],
            }}
            onSubmit={(values) => {
              console.log(values);
              setDrawerOpen(false);
            }}
          >
            <Form>
              <Stack spacing={2}>
                <TextInputField name="leadName" label="Lead Name" />
                <PasswordField name="password" label="Password" />
                <TextAreaInputField
                  name="description"
                  label="Description"
                  rows={3}
                />
                <NumberInputField name="total" label="Total Units" />
                <AmountInputField name="amount" label="Amount" />

                <SelectDropdownSingle
                  name="productSingle"
                  label="Select Product"
                  fetchOptions={async () => productOptions}
                />


                <SelectDropdownMultiple
                  name="productMulti"
                  label="Products"
                  options={productOptions}
                />

                <DateRangePickerField name="range" label="Deal Period" />

                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Button
                    onClick={() => setDrawerOpen(false)}
                    color="inherit"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="contained">
                    Save Lead
                  </Button>
                </Stack>
              </Stack>
            </Form>
          </Formik>
        )}

        {drawerType === "filter" && (
          <Stack spacing={2}>
            <Typography variant="body2">
              Filter options coming soon…
            </Typography>
          </Stack>
        )}
      </AppDrawer>

      {/* ================= FILTER FORM ================= */}
      <Box maxWidth={400}>
        <Formik
          initialValues={{
            date: null,
            products: [],
          }}
          onSubmit={(values) => console.log(values)}
        >
          <Form>
            <Stack spacing={2}>
              <DatePickerField name="date" label="Select Date" />

              <SelectDropdownMultiple
                name="products"
                label="Products"
                options={productOptions}
              />

              <Button
                type="submit"
                variant="contained"
                endIcon={<SendIcon />}
                onClick={handleLoading}
              >
                Apply Filter
              </Button>
            </Stack>
          </Form>
        </Formik>
      </Box>

      {/* ================= BUTTON VARIANTS ================= */}
      <Stack direction="row" spacing={2} flexWrap="wrap">
        <Button variant="outlined" color="error" startIcon={<DeleteIcon />}>
          Delete
        </Button>

        <Button variant="contained" endIcon={<SendIcon />}>
          Send
        </Button>

        <Button variant="outlined" disabled>
          Disabled
        </Button>

        <Button
          variant="contained"
          loading={loading}
          loadingPosition="end"
          endIcon={<SendIcon />}
          onClick={handleLoading}
        >
          Send
        </Button>

        <Button
          variant="contained"
          color="secondary"
          loading={loading}
          loadingPosition="start"
          startIcon={<SaveIcon />}
          onClick={handleLoading}
        >
          Save
        </Button>
      </Stack>

      {/* ================= BASE TABLE ================= */}
      <BaseTable
        title="Sales Overview"
        columns={columns}
        rows={rows}
        selectable
        onDelete={() => alert("Delete selected")}
        onFilter={() => openDrawer("filter")}
      />

      {/* ================= COMMON TABLE ================= */}
      <CommonTable 
        title="Performance Analysis Matrix"
        columns={myColumns}
        rows={myData}
        dynamicHeaderLabel="February 2026"
        stickyLeftColumn="kamName"
        stickyRightColumns={['totalInvSum', 'totalTarget', 'totalAch']}
        columnWidths={{
          kamName: 200,
          totalInvSum: 120,
          totalTarget: 120,
          totalAch: 100
        }}
      />

      {/* ================= KANBAN ================= */}
      <KanbanCard
        title="Sales Pipeline"
        data={salesData}
        setData={setSalesData}
      />

      {/* ================= TASK CALENDAR ================= */}
      <Box>
        <Typography variant="h6" color="initial" fontWeight={400} sx={{ mb: 2 }}>
          Task Calendar
        </Typography>

        <Box
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            border: "1px solid #e2e8f0",
            backgroundColor: "#ffffff",
          }}
        >
          <TaskCalendar />
        </Box>
      </Box>





      {/* ================= Rich Text Editor ================= */}
<Typography variant="h6" color="initial" fontWeight={400} sx={{ mt: 6 }}>
  CRM Rich Text Editor (Test)
</Typography>

<RichTextEditor
  value={editorContent}
  onChange={(content) => setEditorContent(content)}
  placeholder="Write something here..."
/>

{/* Display editor JSON output */}
<TextField
  label="Saved Content (JSON)"
  multiline
  rows={10}
  value={editorContent ? JSON.stringify(editorContent, null, 2) : ""}
  fullWidth
  sx={{ mt: 2 }}
  InputProps={{
    readOnly: true,
  }}
/>


  {/* ================= Rich Text Renderer ================= */}
  <Typography variant="h6" color="initial" fontWeight={400} sx={{ mt: 4 }}>
    Rendered Content (HTML)
  </Typography>

  <RichTextRenderer
    content={editorContent} // this is the JSON from your RichTextEditor
    sx={{
      mt: 1,
      p: 2,
      border: "1px solid #ddd",
      borderRadius: 1,
      minHeight: 150,
      backgroundColor: "#fff",
      overflowX: "auto",
    }}
  />

    {/* Charts */}
    <ChartComponents />


    </Box>
  );
}
