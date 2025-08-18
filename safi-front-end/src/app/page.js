"use client";
import React, { useState, useEffect } from "react";
import {
  Table,
  TextInput,
  Button,
  Modal,
  Group,
  Text,
  Badge,
  Container,
  Title,
  Grid,
  Card,
  NumberInput,
  Stack,
  Loader,
  Center,
  Alert,
  Box,
  Divider,
  Paper,
  Pagination,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import {
  IconSearch,
  IconPlus,
  IconUser,
  IconPhone,
  IconCalendar,
  IconPackage,
  IconCurrencyDollar,
  IconLogout,
  IconAlertCircle,
  IconPrinter,
  IconReceipt,
  IconEye,
  IconShieldCheck,
  IconBolt,
} from "@tabler/icons-react";
import { DateTimePicker } from "@mantine/dates";

const TrustsList = () => {
  const [trusts, setTrusts] = useState([]);
  const [filteredTrusts, setFilteredTrusts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [opened, { open, close }] = useDisclosure(false);
  const [receiptOpened, { open: openReceipt, close: closeReceipt }] =
    useDisclosure(false);
  const [currentReceipt, setCurrentReceipt] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const form = useForm({
    initialValues: {
      visitorName: "",
      phoneNumber: "",
      numberOfBigItems: 0,
      numberOfSmallItems: 0,
      numberOfElectricalItems: 0,
      enterTime: new Date(),
    },
    validate: {
      visitorName: (value) => (!value ? "اسم المودع مطلوب" : null),
      phoneNumber: (value) => (!value ? "رقم الهاتف مطلوب" : null),
      numberOfBigItems: (value) =>
        value < 0 ? "لا يمكن أن يكون سالبًا" : null,
      numberOfSmallItems: (value) =>
        value < 0 ? "لا يمكن أن يكون سالبًا" : null,
      numberOfElectricalItems: (value) =>
        value < 0 ? "لا يمكن أن يكون سالبًا" : null,
    },
  });

  useEffect(() => {
    fetchTrusts();
  }, []);

  useEffect(() => {
    filterTrusts();
  }, [trusts, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredTrusts]);

  const fetchTrusts = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3000/stock");
      if (!response.ok) throw new Error("فشل في جلب بيانات الأمانات");
      const data = await response.json();
      setTrusts(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterTrusts = () => {
    let filtered = trusts;

    if (searchQuery) {
      filtered = filtered.filter(
        (trust) =>
          trust.visitorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          trust.serialNumber
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          trust.phoneNumber.includes(searchQuery)
      );
    }

    setFilteredTrusts(filtered);
  };

  const handleAddTrust = async (values) => {
    try {
      const response = await fetch("http://localhost:3000/stock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          enterTime: values.enterTime.toISOString(),
        }),
      });

      if (!response.ok) throw new Error("فشل في إضافة الأمانة");

      await fetchTrusts();
      form.reset();
      close();
    } catch (err) {
      setError("خطأ في إضافة الأمانة: " + err.message);
    }
  };

  const handleCheckout = async (trustId) => {
    try {
      const response = await fetch(
        `http://localhost:3000/stock/${trustId}/checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("فشل في تسليم الأمانة");

      const updatedTrust = await response.json();
      setCurrentReceipt(updatedTrust);
      openReceipt();

      await fetchTrusts();
    } catch (err) {
      setError("خطأ أثناء تسليم الأمانة: " + err.message);
    }
  };

  const handleViewReceipt = (trust) => {
    setCurrentReceipt(trust);
    openReceipt();
  };

  // Function to format items display
  const formatItemsDisplay = (trust) => {
    const items = [];

    if (trust.numberOfBigItems > 0) {
      items.push(`${trust.numberOfBigItems} كبيرة`);
    }

    if (trust.numberOfSmallItems > 0) {
      items.push(`${trust.numberOfSmallItems} صغيرة`);
    }

    if (trust.numberOfElectricalItems > 0) {
      items.push(`${trust.numberOfElectricalItems} كهربائية`);
    }

    return items.join(" • ") || "لا توجد أصناف";
  };

  const handlePrintReceipt = () => {
    const printStyles = `
    <style>
      @media print {
        @page {
          size: A4;
          margin: 10mm;
        }

        body {
          font-family: 'Arial', sans-serif;
          font-size: 13px;
          line-height: 1.6;
          color: #000;
          direction: rtl;
          text-align: right;
          margin: 0;
          padding: 0;
        }

        .receipt-container {
          width: calc(100% - 20mm);
          height: 148mm;
          margin: 0 auto;
          border: 2px solid #000;
          padding: 8mm;
          background: white;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .receipt-header {
          text-align: center;
          margin-bottom: 6mm;
          border-bottom: 1px solid #000;
          padding-bottom: 4mm;
        }

        .receipt-title {
          font-size: 20px;
          font-weight: bold;
          margin: 0 0 3mm 0;
          color: #000;
        }

        .receipt-date {
          font-size: 12px;
          color: #666;
          margin: 0;
        }

        .receipt-body {
          flex: 1;
          display: flex;
          gap: 12mm;
          margin-bottom: 8mm;
        }

        .left-column,
        .right-column {
          flex: 1;
        }

        .receipt-section {
          margin-bottom: 6mm;
        }

        .section-title {
          font-weight: bold;
          font-size: 14px;
          margin-bottom: 4mm;
          color: #000;
          border-bottom: 1px solid #ddd;
          padding-bottom: 2mm;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 3mm;
          font-size: 13px;
        }

        .info-label {
          font-weight: 600;
          color: #333;
        }

        .info-value {
          font-weight: bold;
          color: #000;
        }

        .total-section {
          border-top: 2px solid #000;
          border-bottom: 2px solid #000;
          padding: 4mm 0;
          margin: 6mm 0;
          background-color: #f9f9f9;
          text-align: center;
        }

        .total-row {
          font-size: 18px;
          font-weight: bold;
          color: #000;
        }

        .footer {
          text-align: center;
          padding-top: 4mm;
          border-top: 1px solid #ddd;
          font-size: 12px;
          color: #555;
          font-style: italic;
        }
      }
    </style>
  `;

    const printDocument = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>فاتورة تسليم أمانة</title>
      ${printStyles}
    </head>
    <body>
      <div class="receipt-container">
        <div class="receipt-header">
          <div class="receipt-title">فاتورة تسليم أمانة</div>
          <div class="receipt-date">تاريخ الطباعة: ${formatDate(
            new Date()
          )}</div>
        </div>
        
        <div class="receipt-body">
          <div class="left-column">
            <div class="receipt-section">
              <div class="section-title">معلومات المودع</div>
              <div class="info-row"><span class="info-label">الاسم:</span><span class="info-value">${
                currentReceipt.visitorName
              }</span></div>
              <div class="info-row"><span class="info-label">الرقم المسلسل:</span><span class="info-value">#${
                currentReceipt.serialNumber
              }</span></div>
              <div class="info-row"><span class="info-label">رقم الهاتف:</span><span class="info-value">${
                currentReceipt.phoneNumber
              }</span></div>
            </div>

            <div class="receipt-section">
              <div class="section-title">الأمانات</div>
              ${
                currentReceipt.numberOfBigItems > 0
                  ? `<div class="info-row"><span class="info-label">الأصناف الكبيرة:</span><span class="info-value">${currentReceipt.numberOfBigItems}</span></div>`
                  : ""
              }
              ${
                currentReceipt.numberOfSmallItems > 0
                  ? `<div class="info-row"><span class="info-label">الأصناف الصغيرة:</span><span class="info-value">${currentReceipt.numberOfSmallItems}</span></div>`
                  : ""
              }
              ${
                currentReceipt.numberOfElectricalItems > 0
                  ? `<div class="info-row"><span class="info-label">الأجهزة الكهربائية:</span><span class="info-value">${currentReceipt.numberOfElectricalItems}</span></div>`
                  : ""
              }
            </div>
          </div>

          <div class="right-column">
            <div class="receipt-section">
              <div class="section-title">تفاصيل الأمانة</div>
              <div class="info-row"><span class="info-label">وقت الإيداع:</span><span class="info-value">${formatDate(
                currentReceipt.enterTime
              )}</span></div>
              <div class="info-row"><span class="info-label">وقت التسليم:</span><span class="info-value">${
                currentReceipt.exitTime
                  ? formatDate(currentReceipt.exitTime)
                  : "لم يتم التسليم بعد"
              }</span></div>
              <div class="info-row"><span class="info-label">عدد الأيام:</span><span class="info-value">${
                currentReceipt.daysStayed || 0
              } ${currentReceipt.daysStayed === 1 ? "يوم" : "أيام"}</span></div>
            </div>
          </div>
        </div>
        
        <div class="total-section">
          <div class="total-row">
            المبلغ الإجمالي: ${formatCurrency(currentReceipt.totalPrice || 0)}
          </div>
        </div>
        
        <div class="footer">
          شكراً لثقتكم بنا
        </div>
      </div>
    </body>
    </html>
  `;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(printDocument);
    printWindow.document.close();

    printWindow.onload = function () {
      printWindow.print();
      printWindow.close();
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return "غير متاح";
    return new Date(dateString).toLocaleString("ar-EG", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("ar-EG", {
      style: "currency",
      currency: "EGP",
    }).format(amount || 0);
  };

  const getStatusBadge = (trust) => {
    if (trust.exitTime) {
      return (
        <Badge color="green" variant="filled">
          تم التسليم
        </Badge>
      );
    }
    return (
      <Badge color="blue" variant="filled">
        محفوظة
      </Badge>
    );
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredTrusts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTrusts = filteredTrusts.slice(startIndex, endIndex);

  if (loading) {
    return (
      <Center h="100vh">
        <Loader size="lg" />
      </Center>
    );
  }

  if (error) {
    return (
      <Container mt="xl">
        <Alert
          icon={<IconAlertCircle size="1rem" />}
          title="خطأ"
          color="red"
          variant="filled"
        >
          {error}
          <Button variant="outline" color="red" mt="sm" onClick={fetchTrusts}>
            إعادة المحاولة
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl" dir="rtl">
      <Stack spacing="xl">
        {/* Header */}
        <Card shadow="sm" p="lg" withBorder>
          <Group position="apart" align="center">
            <Group spacing="md">
              <Box
                sx={(theme) => ({
                  width: 50,
                  height: 50,
                  borderRadius: theme.radius.lg,
                  backgroundColor: theme.colors.blue[6],
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                })}
              >
                <IconShieldCheck size="1.8rem" color="white" />
              </Box>
              <Title order={1} color="blue.8">
                إدارة الأمانات
              </Title>
            </Group>
            <Button
              leftIcon={<IconPlus size="1rem" />}
              onClick={open}
              size="md"
              sx={(theme) => ({
                background: `linear-gradient(135deg, ${theme.colors.blue[6]} 0%, ${theme.colors.blue[7]} 100%)`,
                border: "none",
                "&:hover": {
                  background: `linear-gradient(135deg, ${theme.colors.blue[7]} 0%, ${theme.colors.blue[8]} 100%)`,
                  transform: "translateY(-1px)",
                },
                transition: "all 0.2s ease",
              })}
            >
              إضافة
            </Button>
          </Group>
        </Card>

        {/* Search */}
        <Group position="right">
          <TextInput
            placeholder="بحث بالاسم أو الرقم المسلسل أو الهاتف..."
            icon={<IconSearch size="1rem" />}
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.currentTarget.value)}
            style={{ width: 300 }}
            size="md"
          />
        </Group>

        {/* Results Info */}
        {filteredTrusts.length > 0 && (
          <Text size="sm" color="dimmed">
            عرض {startIndex + 1} إلى {Math.min(endIndex, filteredTrusts.length)}{" "}
            من أصل {filteredTrusts.length} أمانة
          </Text>
        )}

        {/* Trusts Table */}
        {filteredTrusts.length === 0 ? (
          <Card shadow="sm" p="xl">
            <Center>
              <Stack align="center">
                <IconShieldCheck size="3rem" color="gray" />
                <Title order={3} color="dimmed">
                  لم يتم العثور على أمانات
                </Title>
                <Text color="dimmed">
                  {searchQuery
                    ? "حاول تعديل معايير البحث."
                    : "لم يتم تسجيل أي أمانات بعد."}
                </Text>
              </Stack>
            </Center>
          </Card>
        ) : (
          <>
            <Card shadow="sm" p={0}>
              <Table.ScrollContainer minWidth={1000}>
                <Table striped highlightOnHover>
                  <thead>
                    <tr
                      style={{
                        borderBottom: "2px solid #dee2e6",
                        backgroundColor: "#f8f9fa",
                      }}
                    >
                      <th
                        style={{
                          borderRight: "1px solid #dee2e6",
                          padding: "12px 16px",
                          fontWeight: "bold",
                          color: "#495057",
                        }}
                      >
                        المودع
                      </th>
                      <th
                        style={{
                          borderRight: "1px solid #dee2e6",
                          padding: "12px 16px",
                          fontWeight: "bold",
                          color: "#495057",
                        }}
                      >
                        معلومات الاتصال
                      </th>
                      <th
                        style={{
                          borderRight: "1px solid #dee2e6",
                          padding: "12px 16px",
                          fontWeight: "bold",
                          color: "#495057",
                        }}
                      >
                        الأصناف
                      </th>
                      <th
                        style={{
                          borderRight: "1px solid #dee2e6",
                          padding: "12px 16px",
                          fontWeight: "bold",
                          color: "#495057",
                        }}
                      >
                        وقت الإيداع
                      </th>
                      <th
                        style={{
                          borderRight: "1px solid #dee2e6",
                          padding: "12px 16px",
                          fontWeight: "bold",
                          color: "#495057",
                        }}
                      >
                        وقت التسليم
                      </th>
                      <th
                        style={{
                          borderRight: "1px solid #dee2e6",
                          padding: "12px 16px",
                          fontWeight: "bold",
                          color: "#495057",
                        }}
                      >
                        الأيام
                      </th>
                      <th
                        style={{
                          borderRight: "1px solid #dee2e6",
                          padding: "12px 16px",
                          fontWeight: "bold",
                          color: "#495057",
                        }}
                      >
                        الحالة
                      </th>
                      <th
                        style={{
                          borderRight: "1px solid #dee2e6",
                          padding: "12px 16px",
                          fontWeight: "bold",
                          color: "#495057",
                        }}
                      >
                        إجمالي السعر
                      </th>
                      <th
                        style={{
                          padding: "12px 16px",
                          fontWeight: "bold",
                          color: "#495057",
                        }}
                      >
                        الإجراءات
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTrusts.map((trust) => (
                      <tr key={trust._id || trust.id}>
                        <td>
                          <Group spacing="sm">
                            <Box
                              sx={(theme) => ({
                                width: 32,
                                height: 32,
                                borderRadius: theme.radius.sm,
                                backgroundColor: theme.colors.blue[0],
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              })}
                            >
                              <IconUser
                                size="1rem"
                                color="var(--mantine-color-blue-6)"
                              />
                            </Box>
                            <div>
                              <Text weight={500}>{trust.visitorName}</Text>
                              <Text size="xs" color="dimmed">
                                #{trust.serialNumber}
                              </Text>
                            </div>
                          </Group>
                        </td>
                        <td>
                          <Group spacing={4}>
                            <IconPhone size="0.8rem" />
                            <Text size="sm">{trust.phoneNumber}</Text>
                          </Group>
                        </td>
                        <td>
                          <Group spacing={4}>
                            <IconPackage size="0.8rem" />
                            <Text size="sm">{formatItemsDisplay(trust)}</Text>
                          </Group>
                        </td>
                        <td>
                          <Group spacing={4}>
                            <IconCalendar size="0.8rem" />
                            <Text size="sm">{formatDate(trust.enterTime)}</Text>
                          </Group>
                        </td>
                        <td>
                          {trust.exitTime ? (
                            <Group spacing={4}>
                              <IconCalendar size="0.8rem" />
                              <Text size="sm">
                                {formatDate(trust.exitTime)}
                              </Text>
                            </Group>
                          ) : (
                            <Text size="sm" color="blue">
                              محفوظة
                            </Text>
                          )}
                        </td>
                        <td>
                          <Text size="sm">
                            {trust.daysStayed > 0
                              ? `${trust.daysStayed} ${
                                  trust.daysStayed === 1 ? "يوم" : "أيام"
                                }`
                              : "-"}
                          </Text>
                        </td>
                        <td>{getStatusBadge(trust)}</td>
                        <td>
                          <Text weight={500}>
                            {trust.totalPrice
                              ? formatCurrency(trust.totalPrice)
                              : "في الانتظار"}
                          </Text>
                        </td>
                        <td>
                          <Group spacing="xs">
                            {!trust.exitTime ? (
                              <Button
                                size="xs"
                                leftIcon={<IconLogout size="0.8rem" />}
                                onClick={() =>
                                  handleCheckout(trust._id || trust.id)
                                }
                                color="green"
                              >
                                تسليم
                              </Button>
                            ) : (
                              <Button
                                size="xs"
                                variant="outline"
                                leftIcon={<IconEye size="0.8rem" />}
                                onClick={() => handleViewReceipt(trust)}
                                color="blue"
                              >
                                عرض الفاتورة
                              </Button>
                            )}
                          </Group>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Table.ScrollContainer>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
              <Center>
                <Pagination
                  total={totalPages}
                  value={currentPage}
                  onChange={setCurrentPage}
                  size="md"
                />
              </Center>
            )}
          </>
        )}
      </Stack>

      {/* Add Trust Modal */}
      <Modal
        opened={opened}
        onClose={() => {
          close();
          form.reset();
        }}
        title={
          <Group spacing="sm">
            <IconPlus size="1.2rem" />
            <Text weight={500}>إضافة أمانة جديدة</Text>
          </Group>
        }
        size="md"
      >
        <Stack spacing="md">
          <TextInput
            label="اسم المودع"
            placeholder="أدخل اسم المودع"
            icon={<IconUser size="1rem" />}
            {...form.getInputProps("visitorName")}
            required
          />

          <TextInput
            label="رقم الهاتف"
            placeholder="أدخل رقم الهاتف"
            icon={<IconPhone size="1rem" />}
            {...form.getInputProps("phoneNumber")}
            required
          />

          <Grid>
            <Grid.Col span={4}>
              <NumberInput
                label="الأصناف الكبيرة"
                placeholder="0"
                min={0}
                icon={<IconPackage size="1rem" />}
                {...form.getInputProps("numberOfBigItems")}
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <NumberInput
                label="الأصناف الصغيرة"
                placeholder="0"
                min={0}
                icon={<IconPackage size="1rem" />}
                {...form.getInputProps("numberOfSmallItems")}
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <NumberInput
                label="الأجهزة الكهربائية"
                placeholder="0"
                min={0}
                icon={<IconBolt size="1rem" />}
                {...form.getInputProps("numberOfElectricalItems")}
              />
            </Grid.Col>
          </Grid>

          <DateTimePicker
            label="وقت الإيداع"
            icon={<IconCalendar size="1rem" />}
            {...form.getInputProps("enterTime")}
            required
          />

          <Group position="right" mt="md">
            <Button
              variant="subtle"
              onClick={() => {
                close();
                form.reset();
              }}
            >
              إلغاء
            </Button>
            <Button
              leftIcon={<IconPlus size="1rem" />}
              onClick={() => form.onSubmit(handleAddTrust)()}
            >
              إضافة أمانة
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Receipt Modal */}
      <Modal
        opened={receiptOpened}
        onClose={closeReceipt}
        title={
          <Group spacing="sm">
            <IconReceipt size="1.2rem" />
            <Text weight={500}>فاتورة تسليم أمانة</Text>
          </Group>
        }
        size="md"
      >
        {currentReceipt && (
          <div id="receipt-content" dir="rtl">
            <Paper p="lg" withBorder>
              <Stack spacing="md">
                {/* Header */}
                <Center>
                  <Stack align="center" spacing={5}>
                    <Title order={2}>فاتورة تسليم أمانة</Title>
                    <Text size="sm" color="dimmed">
                      تاريخ الطباعة: {formatDate(new Date())}
                    </Text>
                  </Stack>
                </Center>

                <Divider />

                {/* Customer Info */}
                <Stack spacing={5}>
                  <Text weight={500}>معلومات المودع:</Text>
                  <Group position="apart">
                    <Text>الاسم:</Text>
                    <Text weight={500}>{currentReceipt.visitorName}</Text>
                  </Group>
                  <Group position="apart">
                    <Text>الرقم المسلسل:</Text>
                    <Text weight={500}>#{currentReceipt.serialNumber}</Text>
                  </Group>
                  <Group position="apart">
                    <Text>رقم الهاتف:</Text>
                    <Text weight={500}>{currentReceipt.phoneNumber}</Text>
                  </Group>
                </Stack>

                <Divider />

                {/* Visit Details */}
                <Stack spacing={10}>
                  <Text weight={500}>تفاصيل الأمانة:</Text>
                  <Group position="apart">
                    <Text>وقت الإيداع:</Text>
                    <Text>{formatDate(currentReceipt.enterTime)}</Text>
                  </Group>
                  <Group position="apart">
                    <Text>وقت التسليم:</Text>
                    <Text>
                      {currentReceipt.exitTime
                        ? formatDate(currentReceipt.exitTime)
                        : "لم يتم التسليم بعد"}
                    </Text>
                  </Group>
                  <Group position="apart">
                    <Text>عدد الأيام:</Text>
                    <Text>
                      {currentReceipt.daysStayed || 0}{" "}
                      {currentReceipt.daysStayed === 1 ? "يوم" : "أيام"}
                    </Text>
                  </Group>
                </Stack>

                <Divider />

                {/* Items */}
                <Stack spacing={10}>
                  <Text weight={500}>الأمانات:</Text>
                  {currentReceipt.numberOfBigItems > 0 && (
                    <Group position="apart">
                      <Text>الأصناف الكبيرة:</Text>
                      <Text weight={500}>
                        {currentReceipt.numberOfBigItems}
                      </Text>
                    </Group>
                  )}
                  {currentReceipt.numberOfSmallItems > 0 && (
                    <Group position="apart">
                      <Text>الأصناف الصغيرة:</Text>
                      <Text weight={500}>
                        {currentReceipt.numberOfSmallItems}
                      </Text>
                    </Group>
                  )}
                  {currentReceipt.numberOfElectricalItems > 0 && (
                    <Group position="apart">
                      <Text>الأجهزة الكهربائية:</Text>
                      <Text weight={500}>
                        {currentReceipt.numberOfElectricalItems}
                      </Text>
                    </Group>
                  )}
                </Stack>

                <Divider />

                {/* Total */}
                <Group position="apart">
                  <Title order={3}>الإجمالي:</Title>
                  <Title order={3} color="green">
                    {formatCurrency(currentReceipt.totalPrice || 0)}
                  </Title>
                </Group>

                <Divider />

                <Center>
                  <Text size="sm" color="dimmed">
                    شكراً لثقتكم بنا
                  </Text>
                </Center>
              </Stack>
            </Paper>
          </div>
        )}

        <Group position="center" mt="lg">
          <Button
            leftIcon={<IconPrinter size="1rem" />}
            onClick={handlePrintReceipt}
          >
            طباعة الفاتورة
          </Button>
          <Button variant="outline" onClick={closeReceipt}>
            إغلاق
          </Button>
        </Group>
      </Modal>
    </Container>
  );
};

export default TrustsList;
