"use client";
import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
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
  ActionIcon,
  Tooltip,
  Flex,
  Space,
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
  IconEdit,
  IconSettings,
  IconUsers,
  IconUserCircle,
} from "@tabler/icons-react";
import { DateTimePicker } from "@mantine/dates";

// Cookie utility functions (memoized)
const cookieUtils = {
  getCookie: (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  },

  setCookie: (name, value, days = 7) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
  },

  deleteCookie: (name) => {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
  },
};

const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch (e) {
    return null;
  }
};

// Memoized User Profile Component
const UserProfile = memo(({ user, onLogout }) => (
  <Group spacing="sm">
    <Group spacing="xs">
      <IconUserCircle size="1.5rem" color="var(--mantine-color-blue-6)" />
      <Stack spacing={2}>
        <Text size="sm" weight={500}>
          {user?.username || "المستخدم"}
        </Text>
        <Badge
          size="xs"
          variant="light"
          color={user?.role === "admin" ? "red" : "blue"}
        >
          {user?.role === "admin" ? "مشرف" : "مستخدم"}
        </Badge>
      </Stack>
    </Group>

    <Tooltip label="تسجيل الخروج">
      <ActionIcon
        size="lg"
        variant="light"
        color="red"
        onClick={onLogout}
        sx={(theme) => ({
          "&:hover": {
            backgroundColor: theme.colors.red[1],
            transform: "scale(1.05)",
          },
          transition: "all 0.2s ease",
        })}
      >
        <IconLogout size="1.2rem" />
      </ActionIcon>
    </Tooltip>
  </Group>
));

// Memoized Header Component
const TrustsHeader = memo(({ onAddClick, user, onLogout }) => (
  <Card shadow="lg" p="xl" withBorder radius="lg">
    <Flex justify="space-between" align="center" wrap="wrap" gap="md">
      <Group spacing="lg">
        <Box
          sx={(theme) => ({
            width: 60,
            height: 60,
            borderRadius: theme.radius.xl,
            background: `linear-gradient(135deg, ${theme.colors.blue[6]} 0%, ${theme.colors.blue[8]} 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: theme.shadows.md,
          })}
        >
          <IconShieldCheck size="2rem" color="white" />
        </Box>
        <Stack spacing={5}>
          <Title order={1} color="blue.8" size="2rem">
            نظام إدارة الأمانات
          </Title>
          <Text color="dimmed" size="sm">
            إدارة شاملة وآمنة للأمانات والودائع
          </Text>
        </Stack>
      </Group>

      <Flex align="center" gap="lg" wrap="wrap">
        {user?.role === "admin" && (
          <Group spacing="sm">
            <Button
              leftIcon={<IconCurrencyDollar size="1rem" />}
              variant="light"
              color="green"
              onClick={() => (window.location.href = "/prices")}
              size="sm"
            >
              الأسعار
            </Button>
            <Button
              leftIcon={<IconUsers size="1rem" />}
              variant="light"
              color="violet"
              onClick={() => (window.location.href = "/users")}
              size="sm"
            >
              المستخدمين
            </Button>
          </Group>
        )}

        <Button
          leftIcon={<IconPlus size="1rem" />}
          onClick={onAddClick}
          size="md"
          sx={(theme) => ({
            background: `linear-gradient(135deg, ${theme.colors.blue[6]} 0%, ${theme.colors.blue[7]} 100%)`,
            border: "none",
            "&:hover": {
              background: `linear-gradient(135deg, ${theme.colors.blue[7]} 0%, ${theme.colors.blue[8]} 100%)`,
              transform: "translateY(-2px)",
            },
            transition: "all 0.3s ease",
            boxShadow: theme.shadows.md,
          })}
        >
          إضافة أمانة جديدة
        </Button>

        <UserProfile user={user} onLogout={onLogout} />
      </Flex>
    </Flex>
  </Card>
));

// Memoized Search Component with debounced input
const SearchBar = memo(({ searchQuery, onSearchChange, totalResults }) => (
  <Card shadow="sm" p="md" withBorder radius="md">
    <Flex justify="space-between" align="center" wrap="wrap" gap="md">
      <TextInput
        placeholder="بحث بالاسم أو الرقم المسلسل أو الهاتف..."
        icon={<IconSearch size="1rem" />}
        value={searchQuery}
        onChange={(event) => onSearchChange(event.currentTarget.value)}
        size="md"
        sx={{ flexGrow: 1, maxWidth: 400 }}
        styles={(theme) => ({
          input: {
            borderRadius: theme.radius.md,
            "&:focus": {
              borderColor: theme.colors.blue[5],
            },
          },
        })}
      />

      <Group spacing="md">
        <Text size="sm" color="dimmed" weight={500}>
          إجمالي الأمانات:{" "}
          <Text span color="blue" weight={700}>
            {totalResults}
          </Text>
        </Text>
        {searchQuery && (
          <Badge variant="light" color="blue" size="sm">
            نتائج البحث
          </Badge>
        )}
      </Group>
    </Flex>
  </Card>
));

// Memoized Status Badge Component
const StatusBadge = memo(({ trust }) => {
  if (trust.exitTime) {
    return (
      <Badge
        color="green"
        variant="filled"
        size="md"
        sx={(theme) => ({
          background: `linear-gradient(135deg, ${theme.colors.green[5]} 0%, ${theme.colors.green[7]} 100%)`,
        })}
      >
        ✓ تم التسليم
      </Badge>
    );
  }
  return (
    <Badge
      color="blue"
      variant="filled"
      size="md"
      sx={(theme) => ({
        background: `linear-gradient(135deg, ${theme.colors.blue[5]} 0%, ${theme.colors.blue[7]} 100%)`,
      })}
    >
      ⏳ محفوظة
    </Badge>
  );
});

// Memoized Action Buttons Component
const ActionButtons = memo(({ trust, onEdit, onCheckout, onViewReceipt }) => {
  const handleEdit = useCallback(() => onEdit(trust), [trust, onEdit]);
  const handleCheckout = useCallback(
    () => onCheckout(trust._id || trust.id),
    [trust, onCheckout]
  );
  const handleViewReceipt = useCallback(
    () => onViewReceipt(trust),
    [trust, onViewReceipt]
  );

  return (
    <Group spacing="xs">
      <Tooltip label="تعديل اسم المودع">
        <ActionIcon
          size="lg"
          variant="light"
          color="orange"
          onClick={handleEdit}
          sx={(theme) => ({
            "&:hover": {
              backgroundColor: theme.colors.orange[1],
              transform: "scale(1.1)",
            },
            transition: "all 0.2s ease",
          })}
        >
          <IconEdit size="1rem" />
        </ActionIcon>
      </Tooltip>

      {!trust.exitTime ? (
        <Tooltip label="تسليم الأمانة">
          <ActionIcon
            size="lg"
            variant="light"
            color="green"
            onClick={handleCheckout}
            sx={(theme) => ({
              "&:hover": {
                backgroundColor: theme.colors.green[1],
                transform: "scale(1.1)",
              },
              transition: "all 0.2s ease",
            })}
          >
            <IconLogout size="1rem" />
          </ActionIcon>
        </Tooltip>
      ) : (
        <Tooltip label="عرض الفاتورة">
          <ActionIcon
            size="lg"
            variant="light"
            color="blue"
            onClick={handleViewReceipt}
            sx={(theme) => ({
              "&:hover": {
                backgroundColor: theme.colors.blue[1],
                transform: "scale(1.1)",
              },
              transition: "all 0.2s ease",
            })}
          >
            <IconEye size="1rem" />
          </ActionIcon>
        </Tooltip>
      )}
    </Group>
  );
});

// Memoized Table Row Component
const TrustTableRow = memo(
  ({
    trust,
    formatItemsDisplay,
    formatDate,
    formatCurrency,
    onEdit,
    onCheckout,
    onViewReceipt,
  }) => (
    <tr key={trust._id || trust.id}>
      <td>
        <Group spacing="md">
          <Box
            sx={(theme) => ({
              width: 40,
              height: 40,
              borderRadius: theme.radius.md,
              backgroundColor: trust.exitTime
                ? theme.colors.green[1]
                : theme.colors.blue[1],
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `2px solid ${
                trust.exitTime ? theme.colors.green[3] : theme.colors.blue[3]
              }`,
            })}
          >
            <IconUser
              size="1.2rem"
              color={
                trust.exitTime
                  ? "var(--mantine-color-green-6)"
                  : "var(--mantine-color-blue-6)"
              }
            />
          </Box>
          <Stack spacing={2}>
            <Text weight={600} size="sm">
              {trust.visitorName}
            </Text>
            <Text size="xs" color="dimmed" weight={500}>
              #{trust.serialNumber}
            </Text>
          </Stack>
        </Group>
      </td>
      <td>
        <Group spacing={6}>
          <IconPhone size="0.9rem" color="var(--mantine-color-gray-6)" />
          <Text size="sm" weight={500}>
            {trust.phoneNumber}
          </Text>
        </Group>
      </td>
      <td>
        <Group spacing={6}>
          <IconPackage size="0.9rem" color="var(--mantine-color-gray-6)" />
          <Text size="sm">{formatItemsDisplay(trust)}</Text>
        </Group>
      </td>
      <td>
        <Group spacing={6}>
          <IconCalendar size="0.9rem" color="var(--mantine-color-gray-6)" />
          <Text size="sm">{formatDate(trust.enterTime)}</Text>
        </Group>
      </td>
      <td>
        {trust.exitTime ? (
          <Group spacing={6}>
            <IconCalendar size="0.9rem" color="var(--mantine-color-green-6)" />
            <Text size="sm" color="green" weight={500}>
              {formatDate(trust.exitTime)}
            </Text>
          </Group>
        ) : (
          <Text
            size="sm"
            color="blue"
            weight={500}
            style={{ fontStyle: "italic" }}
          >
            لم يتم التسليم
          </Text>
        )}
      </td>
      <td>
        <Text size="sm" weight={500}>
          {trust.daysStayed > 0
            ? `${trust.daysStayed} ${trust.daysStayed === 1 ? "يوم" : "أيام"}`
            : "-"}
        </Text>
      </td>
      <td>
        <StatusBadge trust={trust} />
      </td>
      <td>
        <Text
          weight={600}
          color={trust.totalPrice ? "green" : "orange"}
          size="sm"
        >
          {trust.totalPrice ? formatCurrency(trust.totalPrice) : "في الانتظار"}
        </Text>
      </td>
      <td>
        <ActionButtons
          trust={trust}
          onEdit={onEdit}
          onCheckout={onCheckout}
          onViewReceipt={onViewReceipt}
        />
      </td>
    </tr>
  )
);

// Memoized Table Component
const TrustsTable = memo(
  ({
    trusts,
    formatItemsDisplay,
    formatDate,
    formatCurrency,
    onEdit,
    onCheckout,
    onViewReceipt,
  }) => (
    <Card shadow="lg" p={0} radius="lg">
      <Table.ScrollContainer minWidth={1000}>
        <Table
          striped
          highlightOnHover
          sx={(theme) => ({
            "& thead tr": {
              backgroundColor: theme.colors.gray[0],
            },
            "& thead th": {
              borderBottom: `2px solid ${theme.colors.blue[2]}`,
              fontWeight: 700,
              color: theme.colors.gray[8],
              padding: "16px",
            },
            "& tbody tr:hover": {
              backgroundColor: theme.colors.blue[0],
              transform: "scale(1.002)",
            },
            "& tbody td": {
              padding: "12px 16px",
              borderBottom: `1px solid ${theme.colors.gray[2]}`,
            },
          })}
        >
          <thead>
            <tr>
              <th>المودع</th>
              <th>معلومات الاتصال</th>
              <th>الأصناف</th>
              <th>وقت الإيداع</th>
              <th>وقت التسليم</th>
              <th>الأيام</th>
              <th>الحالة</th>
              <th>إجمالي السعر</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {trusts.map((trust) => (
              <TrustTableRow
                key={trust._id || trust.id}
                trust={trust}
                formatItemsDisplay={formatItemsDisplay}
                formatDate={formatDate}
                formatCurrency={formatCurrency}
                onEdit={onEdit}
                onCheckout={onCheckout}
                onViewReceipt={onViewReceipt}
              />
            ))}
          </tbody>
        </Table>
      </Table.ScrollContainer>
    </Card>
  )
);

// Memoized Empty State Component
const EmptyState = memo(({ searchQuery }) => (
  <Card shadow="md" p="xl" radius="lg">
    <Center>
      <Stack align="center" spacing="lg">
        <Box
          sx={(theme) => ({
            width: 80,
            height: 80,
            borderRadius: theme.radius.xl,
            backgroundColor: theme.colors.gray[1],
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          })}
        >
          <IconShieldCheck size="3rem" color="var(--mantine-color-gray-5)" />
        </Box>
        <Stack align="center" spacing="sm">
          <Title order={3} color="dimmed">
            {searchQuery
              ? "لا توجد نتائج مطابقة"
              : "لم يتم تسجيل أي أمانات بعد"}
          </Title>
          <Text color="dimmed" size="sm" align="center">
            {searchQuery
              ? "حاول تعديل معايير البحث للعثور على نتائج أفضل"
              : "ابدأ بإضافة أول أمانة باستخدام الزر أعلاه"}
          </Text>
        </Stack>
      </Stack>
    </Center>
  </Card>
));

// Memoized modals and other components remain the same but with memo wrapping...
const EditTrustModal = memo(
  ({ opened, onClose, form, onSubmit, trustInfo }) => (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group spacing="sm">
          <IconEdit size="1.2rem" color="var(--mantine-color-orange-6)" />
          <Text weight={600}>تعديل اسم المودع</Text>
        </Group>
      }
      size="md"
      centered
      radius="lg"
    >
      <Stack spacing="lg">
        {trustInfo && (
          <Paper p="md" withBorder radius="md" bg="gray.0">
            <Stack spacing="xs">
              <Text size="sm" color="dimmed">
                معلومات الأمانة:
              </Text>
              <Group spacing="md">
                <Text size="sm">
                  <strong>الرقم المسلسل:</strong> #{trustInfo.serialNumber}
                </Text>
                <Text size="sm">
                  <strong>الهاتف:</strong> {trustInfo.phoneNumber}
                </Text>
              </Group>
            </Stack>
          </Paper>
        )}

        <TextInput
          label="اسم المودع الجديد"
          placeholder="أدخل اسم المودع الجديد"
          icon={<IconUser size="1rem" />}
          {...form.getInputProps("visitorName")}
          required
          size="md"
          styles={(theme) => ({
            input: {
              borderRadius: theme.radius.md,
            },
          })}
        />

        <Group position="right" spacing="sm" mt="lg">
          <Button variant="subtle" onClick={onClose} size="md">
            إلغاء
          </Button>
          <Button
            leftIcon={<IconEdit size="1rem" />}
            onClick={() => form.onSubmit(onSubmit)()}
            color="orange"
            size="md"
          >
            حفظ التغييرات
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
);

const TrustFormFields = memo(({ form }) => (
  <Stack spacing="md">
    <TextInput
      label="اسم المودع"
      placeholder="أدخل اسم المودع"
      icon={<IconUser size="1rem" />}
      {...form.getInputProps("visitorName")}
      required
      size="md"
    />

    <TextInput
      label="رقم الهاتف"
      placeholder="أدخل رقم الهاتف"
      icon={<IconPhone size="1rem" />}
      {...form.getInputProps("phoneNumber")}
      required
      size="md"
    />

    <Grid>
      <Grid.Col span={4}>
        <NumberInput
          label="الأصناف الكبيرة"
          placeholder="0"
          min={0}
          icon={<IconPackage size="1rem" />}
          {...form.getInputProps("numberOfBigItems")}
          size="md"
        />
      </Grid.Col>
      <Grid.Col span={4}>
        <NumberInput
          label="الأصناف الصغيرة"
          placeholder="0"
          min={0}
          icon={<IconPackage size="1rem" />}
          {...form.getInputProps("numberOfSmallItems")}
          size="md"
        />
      </Grid.Col>
      <Grid.Col span={4}>
        <NumberInput
          label="الأجهزة الكهربائية"
          placeholder="0"
          min={0}
          icon={<IconBolt size="1rem" />}
          {...form.getInputProps("numberOfElectricalItems")}
          size="md"
        />
      </Grid.Col>
    </Grid>

    <DateTimePicker
      label="وقت الإيداع"
      icon={<IconCalendar size="1rem" />}
      {...form.getInputProps("enterTime")}
      required
      size="md"
    />
  </Stack>
));

const AddTrustModal = memo(({ opened, onClose, form, onSubmit }) => (
  <Modal
    opened={opened}
    onClose={onClose}
    title={
      <Group spacing="sm">
        <IconPlus size="1.2rem" color="var(--mantine-color-blue-6)" />
        <Text weight={600}>إضافة أمانة جديدة</Text>
      </Group>
    }
    size="lg"
    centered
    radius="lg"
  >
    <TrustFormFields form={form} />
    <Group position="right" mt="xl" spacing="sm">
      <Button variant="subtle" onClick={onClose} size="md">
        إلغاء
      </Button>
      <Button
        leftIcon={<IconPlus size="1rem" />}
        onClick={() => form.onSubmit(onSubmit)()}
        size="md"
      >
        إضافة أمانة
      </Button>
    </Group>
  </Modal>
));

const ReceiptContent = memo(({ receipt, formatDate, formatCurrency }) => (
  <Paper p="lg" withBorder>
    <Stack spacing="md">
      <Center>
        <Stack align="center" spacing={5}>
          <Title order={2}>فاتورة تسليم أمانة</Title>
          <Text size="sm" color="dimmed">
            تاريخ الطباعة: {formatDate(new Date())}
          </Text>
        </Stack>
      </Center>

      <Divider />

      <Stack spacing={5}>
        <Text weight={500}>معلومات المودع:</Text>
        <Group position="apart">
          <Text>الاسم:</Text>
          <Text weight={500}>{receipt.visitorName}</Text>
        </Group>
        <Group position="apart">
          <Text>الرقم المسلسل:</Text>
          <Text weight={500}>#{receipt.serialNumber}</Text>
        </Group>
        <Group position="apart">
          <Text>رقم الهاتف:</Text>
          <Text weight={500}>{receipt.phoneNumber}</Text>
        </Group>
      </Stack>

      <Divider />

      <Stack spacing={10}>
        <Text weight={500}>تفاصيل الأمانة:</Text>
        <Group position="apart">
          <Text>وقت الإيداع:</Text>
          <Text>{formatDate(receipt.enterTime)}</Text>
        </Group>
        <Group position="apart">
          <Text>وقت التسليم:</Text>
          <Text>
            {receipt.exitTime
              ? formatDate(receipt.exitTime)
              : "لم يتم التسليم بعد"}
          </Text>
        </Group>
        <Group position="apart">
          <Text>عدد الأيام:</Text>
          <Text>
            {receipt.daysStayed || 0}{" "}
            {receipt.daysStayed === 1 ? "يوم" : "أيام"}
          </Text>
        </Group>
      </Stack>

      <Divider />

      <Stack spacing={10}>
        <Text weight={500}>الأمانات:</Text>
        {receipt.numberOfBigItems > 0 && (
          <Group position="apart">
            <Text>الأصناف الكبيرة:</Text>
            <Text weight={500}>{receipt.numberOfBigItems}</Text>
          </Group>
        )}
        {receipt.numberOfSmallItems > 0 && (
          <Group position="apart">
            <Text>الأصناف الصغيرة:</Text>
            <Text weight={500}>{receipt.numberOfSmallItems}</Text>
          </Group>
        )}
        {receipt.numberOfElectricalItems > 0 && (
          <Group position="apart">
            <Text>الأجهزة الكهربائية:</Text>
            <Text weight={500}>{receipt.numberOfElectricalItems}</Text>
          </Group>
        )}
      </Stack>

      <Divider />

      <Group position="apart">
        <Title order={3}>الإجمالي:</Title>
        <Title order={3} color="green">
          {formatCurrency(receipt.totalPrice || 0)}
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
));

const ReceiptModal = memo(
  ({ opened, onClose, receipt, formatDate, formatCurrency, onPrint }) => (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group spacing="sm">
          <IconReceipt size="1.2rem" />
          <Text weight={500}>فاتورة تسليم أمانة</Text>
        </Group>
      }
      size="md"
      centered
      radius="lg"
    >
      {receipt && (
        <div id="receipt-content" dir="rtl">
          <ReceiptContent
            receipt={receipt}
            formatDate={formatDate}
            formatCurrency={formatCurrency}
          />
        </div>
      )}

      <Group position="center" mt="xl" spacing="sm">
        <Button
          leftIcon={<IconPrinter size="1rem" />}
          onClick={onPrint}
          size="md"
        >
          طباعة الفاتورة
        </Button>
        <Button variant="outline" onClick={onClose} size="md">
          إغلاق
        </Button>
      </Group>
    </Modal>
  )
);

const PaginationComponent = memo(
  ({ currentPage, totalPages, onPageChange }) => (
    <Card shadow="sm" p="md" radius="md">
      <Center>
        <Pagination
          total={totalPages}
          value={currentPage}
          onChange={onPageChange}
          size="lg"
          radius="md"
          withControls
          sx={(theme) => ({
            "& .mantine-Pagination-control": {
              "&[data-active]": {
                backgroundColor: theme.colors.blue[6],
                color: "white",
              },
            },
          })}
        />
      </Center>
    </Card>
  )
);

// Main TrustsList Component with optimizations
const TrustsList = () => {
  const [trusts, setTrusts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [user, setUser] = useState(null);
  const itemsPerPage = 20;

  // Modal states
  const [opened, { open, close }] = useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] =
    useDisclosure(false);
  const [receiptOpened, { open: openReceipt, close: closeReceipt }] =
    useDisclosure(false);

  // Current data states
  const [currentReceipt, setCurrentReceipt] = useState(null);
  const [editingTrust, setEditingTrust] = useState(null);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Memoized filtered trusts
  const filteredTrusts = useMemo(() => {
    if (!debouncedSearchQuery.trim()) return trusts;

    const query = debouncedSearchQuery.toLowerCase();
    return trusts.filter(
      (trust) =>
        trust.visitorName?.toLowerCase().includes(query) ||
        trust.serialNumber?.toLowerCase().includes(query) ||
        trust.phoneNumber?.includes(query)
    );
  }, [trusts, debouncedSearchQuery]);

  // Memoized pagination
  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(filteredTrusts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedTrusts = filteredTrusts.slice(startIndex, endIndex);

    return { totalPages, paginatedTrusts };
  }, [filteredTrusts, currentPage, itemsPerPage]);

  // Forms
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

  const editForm = useForm({
    initialValues: { visitorName: "" },
    validate: { visitorName: (value) => (!value ? "اسم المودع مطلوب" : null) },
  });

  // Memoized auth headers
  const getAuthHeaders = useCallback(() => {
    const token = cookieUtils.getCookie("token");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }, []);

  // Memoized logout handler
  const handleLogout = useCallback(() => {
    cookieUtils.deleteCookie("token");
    cookieUtils.deleteCookie("user");
    setUser(null);
    window.location.href = "/login";
  }, []);

  // Memoized API functions
  const fetchTrusts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3000/stock", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("فشل في جلب بيانات الأمانات");
      const data = await response.json();
      setTrusts(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  const handleAddTrust = useCallback(
    async (values) => {
      try {
        const response = await fetch("http://localhost:3000/stock", {
          method: "POST",
          headers: getAuthHeaders(),
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
    },
    [getAuthHeaders, fetchTrusts, form, close]
  );

  const handleUpdateTrust = useCallback(
    async (values) => {
      try {
        const trustId = editingTrust._id || editingTrust.id;
        const updateData = { visitorName: values.visitorName };

        const response = await fetch(`http://localhost:3000/stock/${trustId}`, {
          method: "PATCH",
          headers: getAuthHeaders(),
          body: JSON.stringify(updateData),
        });

        if (!response.ok) throw new Error("فشل في تحديث الأمانة");

        await fetchTrusts();
        editForm.reset();
        closeEdit();
        setEditingTrust(null);
      } catch (err) {
        setError("خطأ في تحديث الأمانة: " + err.message);
      }
    },
    [editingTrust, getAuthHeaders, fetchTrusts, editForm, closeEdit]
  );

  const handleCheckout = useCallback(
    async (trustId) => {
      try {
        const response = await fetch(
          `http://localhost:3000/stock/${trustId}/checkout`,
          {
            method: "POST",
            headers: getAuthHeaders(),
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
    },
    [getAuthHeaders, fetchTrusts, openReceipt]
  );

  // Memoized helper functions
  const formatItemsDisplay = useCallback((trust) => {
    const items = [];
    if (trust.numberOfBigItems > 0)
      items.push(`${trust.numberOfBigItems} كبيرة`);
    if (trust.numberOfSmallItems > 0)
      items.push(`${trust.numberOfSmallItems} صغيرة`);
    if (trust.numberOfElectricalItems > 0)
      items.push(`${trust.numberOfElectricalItems} كهربائية`);
    return items.join(" • ") || "لا توجد أصناف";
  }, []);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return "غير متاح";
    return new Date(dateString).toLocaleString("ar-EG", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat("ar-EG", {
      style: "currency",
      currency: "EGP",
    }).format(amount || 0);
  }, []);

  // Memoized event handlers
  const handleEditTrust = useCallback(
    (trust) => {
      setEditingTrust(trust);
      editForm.setValues({ visitorName: trust.visitorName });
      openEdit();
    },
    [editForm, openEdit]
  );

  const handleViewReceipt = useCallback(
    (trust) => {
      setCurrentReceipt(trust);
      openReceipt();
    },
    [openReceipt]
  );

  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value);
  }, []);

  const handleAddModalClose = useCallback(() => {
    close();
    form.reset();
  }, [close, form]);

  const handleEditModalClose = useCallback(() => {
    closeEdit();
    editForm.reset();
    setEditingTrust(null);
  }, [closeEdit, editForm]);

  const handlePrintReceipt = useCallback(() => {
    const printStyles = `
    <style>
      @media print {
        @page { size: A4; margin: 10mm; }
        body { font-family: 'Arial', sans-serif; font-size: 13px; line-height: 1.6; color: #000; direction: rtl; text-align: right; margin: 0; padding: 0; }
        .receipt-container { width: calc(100% - 20mm); height: 148mm; margin: 0 auto; border: 2px solid #000; padding: 8mm; background: white; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; }
        .receipt-header { text-align: center; margin-bottom: 6mm; border-bottom: 1px solid #000; padding-bottom: 4mm; }
        .receipt-title { font-size: 20px; font-weight: bold; margin: 0 0 3mm 0; color: #000; }
        .receipt-date { font-size: 12px; color: #666; margin: 0; }
        .receipt-body { flex: 1; display: flex; gap: 12mm; margin-bottom: 8mm; }
        .left-column, .right-column { flex: 1; }
        .receipt-section { margin-bottom: 6mm; }
        .section-title { font-weight: bold; font-size: 14px; margin-bottom: 4mm; color: #000; border-bottom: 1px solid #ddd; padding-bottom: 2mm; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 3mm; font-size: 13px; }
        .info-label { font-weight: 600; color: #333; }
        .info-value { font-weight: bold; color: #000; }
        .total-section { border-top: 2px solid #000; border-bottom: 2px solid #000; padding: 4mm 0; margin: 6mm 0; background-color: #f9f9f9; text-align: center; }
        .total-row { font-size: 18px; font-weight: bold; color: #000; }
        .footer { text-align: center; padding-top: 4mm; border-top: 1px solid #ddd; font-size: 12px; color: #555; font-style: italic; }
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
          <div class="total-row">المبلغ الإجمالي: ${formatCurrency(
            currentReceipt.totalPrice || 0
          )}</div>
        </div>
        
        <div class="footer">شكراً لثقتكم بنا</div>
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
  }, [currentReceipt, formatDate, formatCurrency]);

  // Reset current page when filtered data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredTrusts.length]);

  // Initialize component
  useEffect(() => {
    const token = cookieUtils.getCookie("token");
    if (token) {
      const userData = parseJwt(token);
      setUser(userData);
    }
    fetchTrusts();
  }, [fetchTrusts]);

  // Loading state
  if (loading) {
    return (
      <Center h="100vh">
        <Stack align="center" spacing="lg">
          <Loader size="xl" />
          <Text size="lg" weight={500} color="blue">
            جاري تحميل البيانات...
          </Text>
        </Stack>
      </Center>
    );
  }

  // Error state
  if (error) {
    return (
      <Container mt="xl">
        <Alert
          icon={<IconAlertCircle size="1rem" />}
          title="خطأ في النظام"
          color="red"
          variant="filled"
          radius="lg"
        >
          {error}
          <Group mt="md">
            <Button variant="white" color="red" onClick={fetchTrusts}>
              إعادة المحاولة
            </Button>
          </Group>
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl" dir="rtl">
      <Stack spacing="xl">
        <TrustsHeader onAddClick={open} user={user} onLogout={handleLogout} />

        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          totalResults={filteredTrusts.length}
        />

        {filteredTrusts.length === 0 ? (
          <EmptyState searchQuery={debouncedSearchQuery} />
        ) : (
          <>
            <TrustsTable
              trusts={paginationData.paginatedTrusts}
              formatItemsDisplay={formatItemsDisplay}
              formatDate={formatDate}
              formatCurrency={formatCurrency}
              onEdit={handleEditTrust}
              onCheckout={handleCheckout}
              onViewReceipt={handleViewReceipt}
            />

            {paginationData.totalPages > 1 && (
              <PaginationComponent
                currentPage={currentPage}
                totalPages={paginationData.totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )}
      </Stack>

      <AddTrustModal
        opened={opened}
        onClose={handleAddModalClose}
        form={form}
        onSubmit={handleAddTrust}
      />

      <EditTrustModal
        opened={editOpened}
        onClose={handleEditModalClose}
        form={editForm}
        onSubmit={handleUpdateTrust}
        trustInfo={editingTrust}
      />

      <ReceiptModal
        opened={receiptOpened}
        onClose={closeReceipt}
        receipt={currentReceipt}
        formatDate={formatDate}
        formatCurrency={formatCurrency}
        onPrint={handlePrintReceipt}
      />
    </Container>
  );
};

export default TrustsList;
