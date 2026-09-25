/* =========================================
   AL-DAHAYAN LANGUAGE SYSTEM
   English / Arabic
   Centralized Bilingual UI System
========================================= */

(function () {
  "use strict";

  const LANGUAGE_STORAGE_KEY =
    "alDahayanLanguage";

  const DEFAULT_LANGUAGE = "en";

  const SUPPORTED_LANGUAGES = [
    "en",
    "ar"
  ];

  /* =========================================
     TRANSLATIONS
  ========================================= */

  const translations = {
    en: {

      /* =====================================
         General
      ===================================== */

      home: "Home",
      about: "About",
      parts: "Spare Parts",
      vehicles: "Vehicles",
      vinSearch: "VIN Search",
      inventory: "Inventory",
      services: "Services",
      contact: "Contact",
      inquiry: "Inquiry",

      search: "Search",
      reset: "Reset",
      submit: "Submit",
      save: "Save",
      update: "Update",
      edit: "Edit",
      delete: "Delete",
      activate: "Activate",
      deactivate: "Deactivate",
      add: "Add",
      close: "Close",
      cancel: "Cancel",
      confirm: "Confirm",
      view: "View",
      viewDetails: "View Details",
      learnMore: "Learn More",
      readMore: "Read More",
      back: "Back",
      next: "Next",
      previous: "Previous",
      loading: "Loading...",
      noResults: "No results found.",
      error: "Something went wrong.",
      required: "Required",
      optional: "Optional",
      status: "Status",
      active: "Active",
      inactive: "Inactive",
      yes: "Yes",
      no: "No",
      all: "All",
      none: "None",
      unknown: "Unknown",
      date: "Date",
      time: "Time",
      details: "Details",
      actions: "Actions",
      settings: "Settings",
      dashboard: "Dashboard",
      enabled: "Enabled",
      disabled: "Disabled",

      /* =====================================
         Company
      ===================================== */

      companyName:
        "Al-Dahayan Trading Company",

      companyArabicName:
        "شركة الضحيان التجارية",

      companyTagline:
        "Toyota & Lexus Automotive Spare Parts",

      companyDescription:
        "Professional automotive spare-parts solutions focused on Toyota and Lexus vehicles.",

      aboutCompany:
        "About Al-Dahayan",

      companyOverview:
        "Al-Dahayan Trading Company provides Toyota and Lexus automotive spare-parts solutions with a focus on part identification, compatibility, availability and direct customer connection.",

      mission:
        "Mission",

      missionText:
        "To make Toyota and Lexus spare-parts identification and customer communication easier, clearer and more reliable.",

      vision:
        "Vision",

      visionText:
        "To build a professional digital platform connecting customers with the right automotive spare-parts solutions.",

      /* =====================================
         Navigation
      ===================================== */

      mainNavigation:
        "Main Navigation",

      openMenu:
        "Open menu",

      closeMenu:
        "Close menu",

      language:
        "Language",

      english:
        "English",

      arabic:
        "العربية",

      switchToArabic:
        "العربية",

      switchToEnglish:
        "English",

      /* =====================================
         Hero
      ===================================== */

      heroTitle:
        "Toyota & Lexus Spare Parts",

      heroSubtitle:
        "Find the right automotive spare part using OEM number, vehicle information or VIN.",

      heroDescription:
        "Explore parts, check compatibility and connect directly with Al-Dahayan Trading Company for availability and inquiry.",

      searchParts:
        "Search Spare Parts",

      findYourPart:
        "Find Your Part",

      connectWithUs:
        "Connect With Us",

      /* =====================================
         Search
      ===================================== */

      searchPartsTitle:
        "Search Spare Parts",

      searchPartsDescription:
        "Search Toyota and Lexus parts using OEM number, part name, category or vehicle information.",

      searchByOEM:
        "Search by OEM Number",

      oemNumber:
        "OEM Number",

      enterOEM:
        "Enter OEM part number",

      partNumber:
        "Part Number",

      partName:
        "Part Name",

      brand:
        "Brand",

      category:
        "Category",

      model:
        "Model",

      year:
        "Year",

      engine:
        "Engine",

      selectBrand:
        "Select Brand",

      selectCategory:
        "Select Category",

      selectModel:
        "Select Model",

      selectYear:
        "Select Year",

      selectEngine:
        "Select Engine",

      searchResults:
        "Search Results",

      resultsFound:
        "results found",

      /* =====================================
         Vehicle Search
      ===================================== */

      vehicleSearchTitle:
        "Search by Vehicle",

      vehicleSearchDescription:
        "Select your Toyota or Lexus vehicle to find compatible spare parts.",

      make:
        "Make",

      selectMake:
        "Select Make",

      vehicle:
        "Vehicle",

      vehicles:
        "Vehicles",

      compatibleParts:
        "Compatible Parts",

      vehicleDetails:
        "Vehicle Details",

      vehicleInformation:
        "Vehicle Information",

      /* =====================================
         VIN
      ===================================== */

      vinSearchTitle:
        "VIN Search",

      vinSearchDescription:
        "Enter a vehicle identification number to identify the vehicle and explore compatible parts.",

      vin:
        "VIN",

      enterVIN:
        "Enter VIN",

      searchVIN:
        "Search VIN",

      validateVIN:
        "Validate VIN",

      invalidVIN:
        "Please enter a valid VIN.",

      vehicleIdentified:
        "Vehicle Identified",

      vinResults:
        "VIN Search Results",

      vinFoundationNotice:
        "VIN search is currently a foundation feature and may require additional verification for exact vehicle configuration.",

      /* =====================================
         Inventory
      ===================================== */

      inventoryTitle:
        "Parts Inventory",

      inventoryDescription:
        "Explore available stock information for Toyota and Lexus spare parts.",

      stock:
        "Stock",

      stockStatus:
        "Stock Status",

      available:
        "Available",

      inStock:
        "In Stock",

      lowStock:
        "Low Stock",

      outOfStock:
        "Out of Stock",

      onRequest:
        "On Request",

      availabilityToBeConfirmed:
        "Availability to be Confirmed",

      unknownStock:
        "Stock information unavailable",

      quantity:
        "Quantity",

      availableQuantity:
        "Available Quantity",

      reservedQuantity:
        "Reserved Quantity",

      inventorySummary:
        "Inventory Summary",

      totalParts:
        "Total Parts",

      availableParts:
        "Available Parts",

      lowStockParts:
        "Low Stock Parts",

      unavailableParts:
        "Unavailable Parts",

      lastUpdated:
        "Last Updated",

      branchReference:
        "Branch Reference",

      automaticStatus:
        "Automatic Status",

      manualOverride:
        "Manual Override",

      verifiedStock:
        "Verified Stock",

      unverifiedStock:
        "Unverified Stock",

      /* =====================================
         Price
      ===================================== */

      price:
        "Price",

      priceOnRequest:
        "Price on Request",

      currency:
        "SAR",

      askForPrice:
        "Ask for Price",

      /* =====================================
         Services
      ===================================== */

      servicesTitle:
        "Our Services",

      servicesDescription:
        "Professional Toyota and Lexus automotive spare-parts support.",

      sparePartsService:
        "Toyota & Lexus Spare Parts",

      sparePartsServiceText:
        "Spare-parts solutions for Toyota and Lexus vehicles.",

      oemSourcing:
        "OEM Parts Sourcing",

      oemSourcingText:
        "Identify and source parts using OEM part numbers.",

      vinIdentification:
        "VIN Identification",

      vinIdentificationText:
        "Use VIN information as part of vehicle and part identification.",

      vehicleSearchService:
        "Vehicle-Based Search",

      vehicleSearchServiceText:
        "Find compatible parts using vehicle make, model, year and engine information.",

      partIdentification:
        "Part Identification",

      partIdentificationText:
        "Support customers in identifying the required automotive part.",

      stockAvailability:
        "Stock Availability",

      stockAvailabilityText:
        "Check available inventory information before making an inquiry.",

      inquirySupport:
        "Inquiry Support",

      inquirySupportText:
        "Connect directly with the company for availability and pricing information.",

      /* =====================================
         Inquiry
      ===================================== */

      inquiryTitle:
        "Customer Inquiry",

      inquiryDescription:
        "Send your spare-parts request directly to Al-Dahayan Trading Company.",

      customerInformation:
        "Customer Information",

      customerName:
        "Customer Name",

      phone:
        "Phone",

      whatsapp:
        "WhatsApp",

      email:
        "Email",

      customerMessage:
        "Message",

      enterName:
        "Enter your name",

      enterPhone:
        "Enter phone or WhatsApp number",

      enterEmail:
        "Enter your email",

      enterMessage:
        "Enter your message",

      partInformation:
        "Part Information",

      requestedPart:
        "Requested Part",

      requestedQuantity:
        "Requested Quantity",

      inquiryConsent:
        "I confirm that the information provided is correct.",

      sendInquiry:
        "Send Inquiry",

      submitInquiry:
        "Submit Inquiry",

      inquirySubmitted:
        "Your inquiry has been saved successfully.",

      inquiryError:
        "Unable to submit the inquiry.",

      whatsappInquiry:
        "Continue on WhatsApp",

      inquiryStatus:
        "Inquiry Status",

      communicationStatus:
        "Communication Status",

      assignedStaff:
        "Assigned Staff",

      followUpDate:
        "Follow-up Date",

      quotationStatus:
        "Quotation Status",

      inquirySource:
        "Inquiry Source",

      notes:
        "Notes",

      newInquiry:
        "New",

      contacted:
        "Contacted",

      inProgress:
        "In Progress",

      quoted:
        "Quoted",

      completed:
        "Completed",

      cancelled:
        "Cancelled",

      noResponse:
        "No Response",

      followUpRequired:
        "Follow-up Required",

      /* =====================================
         Contact
      ===================================== */

      contactTitle:
        "Contact Al-Dahayan",

      contactDescription:
        "Connect directly with Al-Dahayan Trading Company.",

      contactInformation:
        "Contact Information",

      phoneNumber:
        "Phone Number",

      emailAddress:
        "Email Address",

      location:
        "Location",

      workingHours:
        "Working Hours",

      sendMessage:
        "Send Message",

      callNow:
        "Call Now",

      emailUs:
        "Email Us",

      contactUs:
        "Contact Us",

      /* =====================================
         Branches
      ===================================== */

      branches:
        "Branches",

      branch:
        "Branch",

      branchName:
        "Branch Name",

      branchAddress:
        "Branch Address",

      branchPhone:
        "Branch Phone",

      branchWhatsApp:
        "Branch WhatsApp",

      branchServices:
        "Branch Services",

      branchHours:
        "Opening Hours",

      branchStatus:
        "Branch Status",

      branchReference:
        "Branch ID",

      warehouse:
        "Warehouse",

      salesBranch:
        "Sales Branch",

      /* =====================================
         Breadcrumb
      ===================================== */

      breadcrumbHome:
        "Home",

      breadcrumbParts:
        "Spare Parts",

      breadcrumbVehicles:
        "Vehicles",

      breadcrumbVIN:
        "VIN Search",

      breadcrumbInventory:
        "Inventory",

      breadcrumbServices:
        "Services",

      breadcrumbContact:
        "Contact",

      breadcrumbInquiry:
        "Inquiry",

      breadcrumbBranches:
        "Branches",

      /* =====================================
         Footer
      ===================================== */

      quickLinks:
        "Quick Links",

      company:
        "Company",

      customerSupport:
        "Customer Support",

      followUs:
        "Follow Us",

      allRightsReserved:
        "All rights reserved.",

      privacyPolicy:
        "Privacy Policy",

      terms:
        "Terms & Conditions",

      /* =====================================
         Customer Connection
      ===================================== */

      customerConnection:
        "Connect With Al-Dahayan",

      customerConnectionText:
        "Found a part or need help identifying one? Send your request directly to the company.",

      requestPart:
        "Request a Part",

      askAvailability:
        "Ask Availability",

      /* =====================================
         Trust
      ===================================== */

      professionalService:
        "Professional Service",

      trustedPartsInformation:
        "Structured Parts Information",

      directCustomerConnection:
        "Direct Customer Connection",

      transparentProcess:
        "Clear & Transparent Process",

      /* =====================================
         AI Assistant
      ===================================== */

      aiAssistant:
        "AI Assistant",

      aiAssistantTitle:
        "Al-Dahayan AI Assistant",

      aiAssistantDescription:
        "Get help identifying Toyota and Lexus spare parts and connect with the Al-Dahayan team.",

      aiWelcome:
        "Hello! How can I help you find the right Toyota or Lexus spare part?",

      aiInputPlaceholder:
        "Tell me what part you need...",

      aiSend:
        "Send",

      aiThinking:
        "Thinking...",

      aiConnectWhatsApp:
        "Connect on WhatsApp",

      aiHandover:
        "Connect with Al-Dahayan Team",

      aiInventoryVerification:
        "Inventory verification required",

      aiNoVerifiedStock:
        "Verified stock information is not available yet. The Al-Dahayan team can confirm availability.",

      aiNoGuessing:
        "I can only provide information supported by verified company data.",

      aiCustomerLocationDisabled:
        "Customer location collection is not required.",

      /* =====================================
         Admin Panel
      ===================================== */

      adminPanel:
        "Al-Dahayan Admin Panel",

      admin:
        "Admin",

      adminDashboard:
        "Admin Dashboard",

      adminOverview:
        "Overview",

      quickActions:
        "Quick Actions",

      management:
        "Management",

      systemStatus:
        "System Status",

      recentInquiries:
        "Recent Inquiries",

      inventoryAlerts:
        "Inventory Alerts",

      /* Admin sections */

      adminInventory:
        "Inventory",

      adminParts:
        "OEM / Parts Database",

      adminInquiries:
        "Customer Inquiries",

      adminBranches:
        "Branches",

      adminVehicles:
        "Vehicles",

      adminAI:
        "AI Assistant",

      adminSocial:
        "Social Media",

      adminSettings:
        "Website Settings",

      /* Admin inventory */

      addPart:
        "Add Part",

      editPart:
        "Edit Part",

      addInventory:
        "Add Inventory",

      updateStock:
        "Update Stock",

      stockQuantity:
        "Stock Quantity",

      stockMode:
        "Stock Mode",

      automatic:
        "Automatic",

      manual:
        "Manual",

      manualStatus:
        "Manual Status",

      activeRecord:
        "Active Record",

      inactiveRecord:
        "Inactive Record",

      oemInformation:
        "OEM Information",

      vehicleCompatibility:
        "Vehicle Compatibility",

      recordControl:
        "Record Control",

      changeHistory:
        "Change History",

      changedBy:
        "Changed By",

      changedAt:
        "Changed At",

      /* Admin inquiry */

      pendingFollowUps:
        "Pending Follow-ups",

      todayInquiries:
        "Today's Inquiries",

      weeklyInquiries:
        "Last 7 Days",

      monthlyInquiries:
        "This Month",

      aiInquiries:
        "AI Assistant Inquiries",

      websiteInquiries:
        "Website Inquiries",

      whatsappInquiries:
        "WhatsApp Inquiries",

      assign:
        "Assign",

      setFollowUp:
        "Set Follow-up",

      markCompleted:
        "Mark Completed",

      /* Admin AI */

      aiSettings:
        "AI Settings",

      aiEnabled:
        "AI Assistant Enabled",

      salesMode:
        "Sales Mode",

      inventoryVerificationRequired:
        "Inventory Verification Required",

      whatsappConnection:
        "WhatsApp Connection",

      aiInstructions:
        "AI Instructions",

      aiKnowledge:
        "AI Knowledge Sources",

      customerLocationCollection:
        "Customer Location Collection",

      proactiveBranchRecommendation:
        "Proactive Branch Recommendation",

      /* Admin social */

      socialMedia:
        "Social Media",

      socialChannels:
        "Social Channels",

      platform:
        "Platform",

      platformURL:
        "Platform URL",

      addChannel:
        "Add Channel",

      activeChannel:
        "Active Channel",

      /* Admin settings */

      websiteSettings:
        "Website Settings",

      companySettings:
        "Company Settings",

      contactSettings:
        "Contact Settings",

      languageSettings:
        "Language Settings",

      featureSettings:
        "Feature Settings",

      paymentSettings:
        "Payment Settings",

      paymentSystem:
        "Payment System",

      onlinePayment:
        "Online Payment",

      orderPayment:
        "Order Payment",

      paymentGateway:
        "Payment Gateway",

      gatewayConnected:
        "Gateway Connected",

      paymentCurrentlyDisabled:
        "Online payment is currently disabled.",

      /* =====================================
         Empty / Error
      ===================================== */

      noPartsFound:
        "No spare parts found.",

      noVehiclesFound:
        "No vehicles found.",

      noInventoryFound:
        "No inventory records found.",

      noCompatibleParts:
        "No compatible parts found.",

      noBranchesFound:
        "No branches found.",

      noInquiriesFound:
        "No inquiries found.",

      dataLoading:
        "Loading data...",

      dataLoadError:
        "Unable to load data.",

      saveSuccess:
        "Saved successfully.",

      updateSuccess:
        "Updated successfully.",

      saveError:
        "Unable to save changes.",

      /* =====================================
         Modal / Loading
      ===================================== */

      information:
        "Information",

      closeDialog:
        "Close dialog",

      pleaseWait:
        "Please wait...",

      /* =====================================
         Accessibility
      ===================================== */

      skipToContent:
        "Skip to main content",

      menu:
        "Menu",

      /* =====================================
         SEO / Page Titles
      ===================================== */

      pageTitleHome:
        "Al-Dahayan Trading Company | Toyota & Lexus Spare Parts",

      pageTitleAbout:
        "About Al-Dahayan | Toyota & Lexus Spare Parts",

      pageTitleParts:
        "Spare Parts Search | Al-Dahayan",

      pageTitleVehicles:
        "Vehicle Search | Al-Dahayan",

      pageTitleVIN:
        "VIN Search | Al-Dahayan",

      pageTitleInventory:
        "Parts Inventory | Al-Dahayan",

      pageTitleServices:
        "Services | Al-Dahayan",

      pageTitleContact:
        "Contact | Al-Dahayan",

      pageTitleInquiry:
        "Customer Inquiry | Al-Dahayan",

      pageTitleAdmin:
        "Admin Panel | Al-Dahayan"
    },

    /* =======================================
       ARABIC
    ======================================= */

    ar: {

      /* General */

      home: "الرئيسية",
      about: "من نحن",
      parts: "قطع الغيار",
      vehicles: "المركبات",
      vinSearch: "بحث VIN",
      inventory: "المخزون",
      services: "الخدمات",
      contact: "اتصل بنا",
      inquiry: "استفسار",

      search: "بحث",
      reset: "إعادة تعيين",
      submit: "إرسال",
      save: "حفظ",
      update: "تحديث",
      edit: "تعديل",
      delete: "حذف",
      activate: "تفعيل",
      deactivate: "تعطيل",
      add: "إضافة",
      close: "إغلاق",
      cancel: "إلغاء",
      confirm: "تأكيد",
      view: "عرض",
      viewDetails: "عرض التفاصيل",
      learnMore: "اعرف المزيد",
      readMore: "اقرأ المزيد",
      back: "رجوع",
      next: "التالي",
      previous: "السابق",
      loading: "جارٍ التحميل...",
      noResults: "لم يتم العثور على نتائج.",
      error: "حدث خطأ.",
      required: "مطلوب",
      optional: "اختياري",
      status: "الحالة",
      active: "نشط",
      inactive: "غير نشط",
      yes: "نعم",
      no: "لا",
      all: "الكل",
      none: "لا يوجد",
      unknown: "غير معروف",
      date: "التاريخ",
      time: "الوقت",
      details: "التفاصيل",
      actions: "الإجراءات",
      settings: "الإعدادات",
      dashboard: "لوحة التحكم",
      enabled: "مفعّل",
      disabled: "معطّل",

      /* Company */

      companyName:
        "شركة الضحيان التجارية",

      companyArabicName:
        "شركة الضحيان التجارية",

      companyTagline:
        "قطع غيار سيارات تويوتا ولكزس",

      companyDescription:
        "حلول متخصصة لقطع غيار السيارات تركز على مركبات تويوتا ولكزس.",

      aboutCompany:
        "عن شركة الضحيان",

      companyOverview:
        "تقدم شركة الضحيان التجارية حلولاً لقطع غيار سيارات تويوتا ولكزس مع التركيز على تحديد القطعة والتوافق والتوفر والتواصل المباشر مع العملاء.",

      mission:
        "رسالتنا",

      missionText:
        "تسهيل عملية تحديد قطع غيار تويوتا ولكزس والتواصل مع العملاء بطريقة واضحة وموثوقة.",

      vision:
        "رؤيتنا",

      visionText:
        "بناء منصة رقمية احترافية تربط العملاء بحلول قطع غيار السيارات المناسبة.",

      /* Navigation */

      mainNavigation:
        "التنقل الرئيسي",

      openMenu:
        "فتح القائمة",

      closeMenu:
        "إغلاق القائمة",

      language:
        "اللغة",

      english:
        "English",

      arabic:
        "العربية",

      switchToArabic:
        "العربية",

      switchToEnglish:
        "English",

      /* Hero */

      heroTitle:
        "قطع غيار تويوتا ولكزس",

      heroSubtitle:
        "اعثر على قطعة غيار السيارات المناسبة باستخدام رقم OEM أو معلومات المركبة أو رقم VIN.",

      heroDescription:
        "استكشف قطع الغيار وتحقق من التوافق وتواصل مباشرة مع شركة الضحيان لمعرفة التوفر والاستفسار.",

      searchParts:
        "البحث عن قطع الغيار",

      findYourPart:
        "ابحث عن قطعتك",

      connectWithUs:
        "تواصل معنا",

      /* Search */

      searchPartsTitle:
        "البحث عن قطع الغيار",

      searchPartsDescription:
        "ابحث عن قطع تويوتا ولكزس باستخدام رقم OEM أو اسم القطعة أو الفئة أو معلومات المركبة.",

      searchByOEM:
        "البحث برقم OEM",

      oemNumber:
        "رقم OEM",

      enterOEM:
        "أدخل رقم قطعة OEM",

      partNumber:
        "رقم القطعة",

      partName:
        "اسم القطعة",

      brand:
        "العلامة التجارية",

      category:
        "الفئة",

      model:
        "الموديل",

      year:
        "السنة",

      engine:
        "المحرك",

      selectBrand:
        "اختر العلامة التجارية",

      selectCategory:
        "اختر الفئة",

      selectModel:
        "اختر الموديل",

      selectYear:
        "اختر السنة",

      selectEngine:
        "اختر المحرك",

      searchResults:
        "نتائج البحث",

      resultsFound:
        "نتيجة",

      /* Vehicle */

      vehicleSearchTitle:
        "البحث حسب المركبة",

      vehicleSearchDescription:
        "اختر مركبة تويوتا أو لكزس للعثور على قطع الغيار المتوافقة.",

      make:
        "الشركة المصنعة",

      selectMake:
        "اختر الشركة المصنعة",

      vehicle:
        "المركبة",

      vehicles:
        "المركبات",

      compatibleParts:
        "قطع الغيار المتوافقة",

      vehicleDetails:
        "تفاصيل المركبة",

      vehicleInformation:
        "معلومات المركبة",

      /* VIN */

      vinSearchTitle:
        "بحث VIN",

      vinSearchDescription:
        "أدخل رقم تعريف المركبة للمساعدة في تحديد المركبة واستكشاف قطع الغيار المتوافقة.",

      vin:
        "VIN",

      enterVIN:
        "أدخل رقم VIN",

      searchVIN:
        "بحث VIN",

      validateVIN:
        "التحقق من VIN",

      invalidVIN:
        "يرجى إدخال رقم VIN صالح.",

      vehicleIdentified:
        "تم تحديد المركبة",

      vinResults:
        "نتائج بحث VIN",

      vinFoundationNotice:
        "بحث VIN هو حالياً ميزة أساسية وقد يتطلب التحقق الإضافي لتحديد مواصفات المركبة بدقة.",

      /* Inventory */

      inventoryTitle:
        "مخزون قطع الغيار",

      inventoryDescription:
        "استكشف معلومات المخزون المتوفرة لقطع غيار تويوتا ولكزس.",

      stock:
        "المخزون",

      stockStatus:
        "حالة المخزون",

      available:
        "متوفر",

      inStock:
        "متوفر في المخزون",

      lowStock:
        "مخزون منخفض",

      outOfStock:
        "غير متوفر",

      onRequest:
        "عند الطلب",

      availabilityToBeConfirmed:
        "التوفر بحاجة إلى تأكيد",

      unknownStock:
        "معلومات المخزون غير متوفرة",

      quantity:
        "الكمية",

      availableQuantity:
        "الكمية المتوفرة",

      reservedQuantity:
        "الكمية المحجوزة",

      inventorySummary:
        "ملخص المخزون",

      totalParts:
        "إجمالي القطع",

      availableParts:
        "القطع المتوفرة",

      lowStockParts:
        "القطع ذات المخزون المنخفض",

      unavailableParts:
        "القطع غير المتوفرة",

      lastUpdated:
        "آخر تحديث",

      branchReference:
        "مرجع الفرع",

      automaticStatus:
        "الحالة التلقائية",

      manualOverride:
        "التجاوز اليدوي",

      verifiedStock:
        "مخزون موثّق",

      unverifiedStock:
        "مخزون غير موثّق",

      /* Price */

      price:
        "السعر",

      priceOnRequest:
        "السعر عند الطلب",

      currency:
        "ريال سعودي",

      askForPrice:
        "طلب السعر",

      /* Services */

      servicesTitle:
        "خدماتنا",

      servicesDescription:
        "دعم احترافي لقطع غيار سيارات تويوتا ولكزس.",

      sparePartsService:
        "قطع غيار تويوتا ولكزس",

      sparePartsServiceText:
        "حلول لقطع غيار سيارات تويوتا ولكزس.",

      oemSourcing:
        "توفير قطع OEM",

      oemSourcingText:
        "تحديد وتوفير القطع باستخدام أرقام OEM.",

      vinIdentification:
        "تحديد المركبة عبر VIN",

      vinIdentificationText:
        "استخدام معلومات VIN ضمن عملية تحديد المركبة والقطعة.",

      vehicleSearchService:
        "البحث حسب المركبة",

      vehicleSearchServiceText:
        "العثور على القطع المتوافقة باستخدام الشركة المصنعة والموديل والسنة والمحرك.",

      partIdentification:
        "تحديد القطعة",

      partIdentificationText:
        "مساعدة العملاء في تحديد قطعة السيارات المطلوبة.",

      stockAvailability:
        "توفر المخزون",

      stockAvailabilityText:
        "التحقق من معلومات المخزون المتاحة قبل إرسال الاستفسار.",

      inquirySupport:
        "دعم الاستفسارات",

      inquirySupportText:
        "التواصل مباشرة مع الشركة لمعرفة التوفر والأسعار.",

      /* Inquiry */

      inquiryTitle:
        "استفسار العميل",

      inquiryDescription:
        "أرسل طلب قطع الغيار مباشرة إلى شركة الضحيان التجارية.",

      customerInformation:
        "معلومات العميل",

      customerName:
        "اسم العميل",

      phone:
        "الهاتف",

      whatsapp:
        "واتساب",

      email:
        "البريد الإلكتروني",

      customerMessage:
        "الرسالة",

      enterName:
        "أدخل اسمك",

      enterPhone:
        "أدخل رقم الهاتف أو واتساب",

      enterEmail:
        "أدخل بريدك الإلكتروني",

      enterMessage:
        "أدخل رسالتك",

      partInformation:
        "معلومات القطعة",

      requestedPart:
        "القطعة المطلوبة",

      requestedQuantity:
        "الكمية المطلوبة",

      inquiryConsent:
        "أؤكد أن المعلومات المقدمة صحيحة.",

      sendInquiry:
        "إرسال الاستفسار",

      submitInquiry:
        "إرسال الاستفسار",

      inquirySubmitted:
        "تم حفظ الاستفسار بنجاح.",

      inquiryError:
        "تعذر إرسال الاستفسار.",

      whatsappInquiry:
        "المتابعة عبر واتساب",

      inquiryStatus:
        "حالة الاستفسار",

      communicationStatus:
        "حالة التواصل",

      assignedStaff:
        "الموظف المسؤول",

      followUpDate:
        "تاريخ المتابعة",

      quotationStatus:
        "حالة عرض السعر",

      inquirySource:
        "مصدر الاستفسار",

      notes:
        "ملاحظات",

      newInquiry:
        "جديد",

      contacted:
        "تم التواصل",

      inProgress:
        "قيد المعالجة",

      quoted:
        "تم تقديم عرض السعر",

      completed:
        "مكتمل",

      cancelled:
        "ملغى",

      noResponse:
        "لا يوجد رد",

      followUpRequired:
        "تحتاج إلى متابعة",

      /* Contact */

      contactTitle:
        "تواصل مع الضحيان",

      contactDescription:
        "تواصل مباشرة مع شركة الضحيان التجارية.",

      contactInformation:
        "معلومات الاتصال",

      phoneNumber:
        "رقم الهاتف",

      emailAddress:
        "البريد الإلكتروني",

      location:
        "الموقع",

      workingHours:
        "ساعات العمل",

      sendMessage:
        "إرسال رسالة",

      callNow:
        "اتصل الآن",

      emailUs:
        "راسلنا عبر البريد",

      contactUs:
        "اتصل بنا",

      /* Branches */

      branches:
        "الفروع",

      branch:
        "الفرع",

      branchName:
        "اسم الفرع",

      branchAddress:
        "عنوان الفرع",

      branchPhone:
        "هاتف الفرع",

      branchWhatsApp:
        "واتساب الفرع",

      branchServices:
        "خدمات الفرع",

      branchHours:
        "ساعات العمل",

      branchStatus:
        "حالة الفرع",

      branchReference:
        "معرّف الفرع",

      warehouse:
        "المستودع",

      salesBranch:
        "فرع المبيعات",

      /* Breadcrumb */

      breadcrumbHome:
        "الرئيسية",

      breadcrumbParts:
        "قطع الغيار",

      breadcrumbVehicles:
        "المركبات",

      breadcrumbVIN:
        "بحث VIN",

      breadcrumbInventory:
        "المخزون",

      breadcrumbServices:
        "الخدمات",

      breadcrumbContact:
        "اتصل بنا",

      breadcrumbInquiry:
        "استفسار",

      breadcrumbBranches:
        "الفروع",

      /* Footer */

      quickLinks:
        "روابط سريعة",

      company:
        "الشركة",

      customerSupport:
        "دعم العملاء",

      followUs:
        "تابعنا",

      allRightsReserved:
        "جميع الحقوق محفوظة.",

      privacyPolicy:
        "سياسة الخصوصية",

      terms:
        "الشروط والأحكام",

      /* Connection */

      customerConnection:
        "تواصل مع الضحيان",

      customerConnectionText:
        "هل وجدت قطعة أو تحتاج إلى المساعدة في تحديدها؟ أرسل طلبك مباشرة إلى الشركة.",

      requestPart:
        "طلب قطعة",

      askAvailability:
        "الاستفسار عن التوفر",

      /* Trust */

      professionalService:
        "خدمة احترافية",

      trustedPartsInformation:
        "معلومات منظمة عن قطع الغيار",

      directCustomerConnection:
        "تواصل مباشر مع العملاء",

      transparentProcess:
        "عملية واضحة وشفافة",

      /* AI */

      aiAssistant:
        "المساعد الذكي",

      aiAssistantTitle:
        "مساعد الضحيان الذكي",

      aiAssistantDescription:
        "احصل على المساعدة في تحديد قطع غيار تويوتا ولكزس والتواصل مع فريق الضحيان.",

      aiWelcome:
        "مرحباً! كيف يمكنني مساعدتك في العثور على قطعة غيار تويوتا أو لكزس المناسبة؟",

      aiInputPlaceholder:
        "أخبرني عن القطعة التي تحتاجها...",

      aiSend:
        "إرسال",

      aiThinking:
        "جارٍ التفكير...",

      aiConnectWhatsApp:
        "التواصل عبر واتساب",

      aiHandover:
        "التواصل مع فريق الضحيان",

      aiInventoryVerification:
        "يلزم التحقق من المخزون",

      aiNoVerifiedStock:
        "لا تتوفر حالياً معلومات موثقة عن المخزون. يمكن لفريق الضحيان تأكيد التوفر.",

      aiNoGuessing:
        "أقدم فقط المعلومات المدعومة ببيانات الشركة الموثقة.",

      aiCustomerLocationDisabled:
        "لا يلزم جمع موقع العميل.",

      /* Admin */

      adminPanel:
        "لوحة تحكم الضحيان",

      admin:
        "الإدارة",

      adminDashboard:
        "لوحة تحكم الإدارة",

      adminOverview:
        "نظرة عامة",

      quickActions:
        "إجراءات سريعة",

      management:
        "الإدارة",

      systemStatus:
        "حالة النظام",

      recentInquiries:
        "أحدث الاستفسارات",

      inventoryAlerts:
        "تنبيهات المخزون",

      adminInventory:
        "المخزون",

      adminParts:
        "قاعدة بيانات OEM / القطع",

      adminInquiries:
        "استفسارات العملاء",

      adminBranches:
        "الفروع",

      adminVehicles:
        "المركبات",

      adminAI:
        "المساعد الذكي",

      adminSocial:
        "وسائل التواصل الاجتماعي",

      adminSettings:
        "إعدادات الموقع",

      /* Admin inventory */

      addPart:
        "إضافة قطعة",

      editPart:
        "تعديل القطعة",

      addInventory:
        "إضافة مخزون",

      updateStock:
        "تحديث المخزون",

      stockQuantity:
        "كمية المخزون",

      stockMode:
        "وضع المخزون",

      automatic:
        "تلقائي",

      manual:
        "يدوي",

      manualStatus:
        "الحالة اليدوية",

      activeRecord:
        "سجل نشط",

      inactiveRecord:
        "سجل غير نشط",

      oemInformation:
        "معلومات OEM",

      vehicleCompatibility:
        "توافق المركبة",

      recordControl:
        "التحكم في السجل",

      changeHistory:
        "سجل التغييرات",

      changedBy:
        "تم التغيير بواسطة",

      changedAt:
        "وقت التغيير",

      /* Admin inquiry */

      pendingFollowUps:
        "المتابعات المعلقة",

      todayInquiries:
        "استفسارات اليوم",

      weeklyInquiries:
        "آخر 7 أيام",

      monthlyInquiries:
        "هذا الشهر",

      aiInquiries:
        "استفسارات المساعد الذكي",

      websiteInquiries:
        "استفسارات الموقع",

      whatsappInquiries:
        "استفسارات واتساب",

      assign:
        "تعيين",

      setFollowUp:
        "تحديد متابعة",

      markCompleted:
        "تحديد كمكتمل",

      /* Admin AI */

      aiSettings:
        "إعدادات المساعد الذكي",

      aiEnabled:
        "تفعيل المساعد الذكي",

      salesMode:
        "وضع المبيعات",

      inventoryVerificationRequired:
        "التحقق من المخزون مطلوب",

      whatsappConnection:
        "اتصال واتساب",

      aiInstructions:
        "تعليمات المساعد الذكي",

      aiKnowledge:
        "مصادر معرفة المساعد الذكي",

      customerLocationCollection:
        "جمع موقع العميل",

      proactiveBranchRecommendation:
        "اقتراح الفروع بشكل استباقي",

      /* Admin social */

      socialMedia:
        "وسائل التواصل الاجتماعي",

      socialChannels:
        "قنوات التواصل الاجتماعي",

      platform:
        "المنصة",

      platformURL:
        "رابط المنصة",

      addChannel:
        "إضافة قناة",

      activeChannel:
        "قناة نشطة",

      /* Admin settings */

      websiteSettings:
        "إعدادات الموقع",

      companySettings:
        "إعدادات الشركة",

      contactSettings:
        "إعدادات الاتصال",

      languageSettings:
        "إعدادات اللغة",

      featureSettings:
        "إعدادات الميزات",

      paymentSettings:
        "إعدادات الدفع",

      paymentSystem:
        "نظام الدفع",

      onlinePayment:
        "الدفع الإلكتروني",

      orderPayment:
        "دفع الطلبات",

      paymentGateway:
        "بوابة الدفع",

      gatewayConnected:
        "البوابة متصلة",

      paymentCurrentlyDisabled:
        "الدفع الإلكتروني معطّل حالياً.",

      /* Empty / Error */

      noPartsFound:
        "لم يتم العثور على قطع غيار.",

      noVehiclesFound:
        "لم يتم العثور على مركبات.",

      noInventoryFound:
        "لم يتم العثور على سجلات مخزون.",

      noCompatibleParts:
        "لم يتم العثور على قطع متوافقة.",

      noBranchesFound:
        "لم يتم العثور على فروع.",

      noInquiriesFound:
        "لم يتم العثور على استفسارات.",

      dataLoading:
        "جارٍ تحميل البيانات...",

      dataLoadError:
        "تعذر تحميل البيانات.",

      saveSuccess:
        "تم الحفظ بنجاح.",

      updateSuccess:
        "تم التحديث بنجاح.",

      saveError:
        "تعذر حفظ التغييرات.",

      /* Modal */

      information:
        "معلومات",

      closeDialog:
        "إغلاق النافذة",

      pleaseWait:
        "يرجى الانتظار...",

      /* Accessibility */

      skipToContent:
        "الانتقال إلى المحتوى الرئيسي",

      menu:
        "القائمة",

      /* Page Titles */

      pageTitleHome:
        "شركة الضحيان التجارية | قطع غيار تويوتا ولكزس",

      pageTitleAbout:
        "عن الضحيان | قطع غيار تويوتا ولكزس",

      pageTitleParts:
        "البحث عن قطع الغيار | الضحيان",

      pageTitleVehicles:
        "البحث حسب المركبة | الضحيان",

      pageTitleVIN:
        "بحث VIN | الضحيان",

      pageTitleInventory:
        "مخزون قطع الغيار | الضحيان",

      pageTitleServices:
        "الخدمات | الضحيان",

      pageTitleContact:
        "اتصل بنا | الضحيان",

      pageTitleInquiry:
        "استفسار العميل | الضحيان",

      pageTitleAdmin:
        "لوحة الإدارة | الضحيان"
    }
  };

  /* =========================================
     UTILITY
  ========================================= */

  function isSupportedLanguage(
    language
  ) {
    return SUPPORTED_LANGUAGES.includes(
      language
    );
  }

  function getStoredLanguage() {
    try {
      const stored =
        localStorage.getItem(
          LANGUAGE_STORAGE_KEY
        );

      return isSupportedLanguage(
        stored
      )
        ? stored
        : null;
    } catch (error) {
      return null;
    }
  }

  function getCurrentLanguage() {
    const htmlLanguage =
      document.documentElement.getAttribute(
        "lang"
      );

    if (
      isSupportedLanguage(
        htmlLanguage
      )
    ) {
      return htmlLanguage;
    }

    const storedLanguage =
      getStoredLanguage();

    if (storedLanguage) {
      return storedLanguage;
    }

    return DEFAULT_LANGUAGE;
  }

  function getDirection(
    language
  ) {
    return language === "ar"
      ? "rtl"
      : "ltr";
  }

  /* =========================================
     TRANSLATION
  ========================================= */

  function translate(
    key,
    language = getCurrentLanguage()
  ) {
    if (!key) {
      return "";
    }

    const selected =
      translations[language] || {};

    const fallback =
      translations[
        DEFAULT_LANGUAGE
      ] || {};

    return (
      selected[key] ??
      fallback[key] ??
      key
    );
  }

  /* =========================================
     TEXT
  ========================================= */

  function applyTextTranslations(
    language
  ) {
    document
      .querySelectorAll(
        "[data-i18n]"
      )
      .forEach(
        function (element) {
          const key =
            element.getAttribute(
              "data-i18n"
            );

          if (!key) {
            return;
          }

          element.textContent =
            translate(
              key,
              language
            );
        }
      );
  }

  /* =========================================
     PLACEHOLDERS
  ========================================= */

  function applyPlaceholderTranslations(
    language
  ) {
    document
      .querySelectorAll(
        "[data-i18n-placeholder]"
      )
      .forEach(
        function (element) {
          const key =
            element.getAttribute(
              "data-i18n-placeholder"
            );

          if (!key) {
            return;
          }

          element.setAttribute(
            "placeholder",
            translate(
              key,
              language
            )
          );
        }
      );
  }

  /* =========================================
     VALUE TRANSLATION
  ========================================= */

  function applyValueTranslations(
    language
  ) {
    document
      .querySelectorAll(
        "[data-i18n-value]"
      )
      .forEach(
        function (element) {
          const key =
            element.getAttribute(
              "data-i18n-value"
            );

          if (!key) {
            return;
          }

          element.value =
            translate(
              key,
              language
            );
        }
      );
  }

  /* =========================================
     PAGE TITLE
  ========================================= */

  function getPageTitleKey() {
    const page =
      document.body?.dataset?.page ||
      "";

    const pageMap = {
      home:
        "pageTitleHome",

      about:
        "pageTitleAbout",

      parts:
        "pageTitleParts",

      vehicles:
        "pageTitleVehicles",

      "vin-search":
        "pageTitleVIN",

      inventory:
        "pageTitleInventory",

      services:
        "pageTitleServices",

      contact:
        "pageTitleContact",

      inquiry:
        "pageTitleInquiry",

      admin:
        "pageTitleAdmin"
    };

    return (
      pageMap[page] ||
      null
    );
  }

  function applyDocumentTitle(
    language
  ) {
    const customTitle =
      document.documentElement.getAttribute(
        "data-title-i18n"
      );

    const pageTitleKey =
      customTitle ||
      getPageTitleKey();

    if (pageTitleKey) {
      document.title =
        translate(
          pageTitleKey,
          language
        );
    }
  }

  /* =========================================
     ACCESSIBILITY
  ========================================= */

  function applyAccessibilityTranslations(
    language
  ) {
    document
      .querySelectorAll(
        "[data-i18n-aria-label]"
      )
      .forEach(
        function (element) {
          const key =
            element.getAttribute(
              "data-i18n-aria-label"
            );

          if (!key) {
            return;
          }

          element.setAttribute(
            "aria-label",
            translate(
              key,
              language
            )
          );
        }
      );

    document
      .querySelectorAll(
        "[data-i18n-title]"
      )
      .forEach(
        function (element) {
          const key =
            element.getAttribute(
              "data-i18n-title"
            );

          if (!key) {
            return;
          }

          element.setAttribute(
            "title",
            translate(
              key,
              language
            )
          );
        }
      );
  }

  /* =========================================
     DIRECTION
  ========================================= */

  function applyDirection(
    language
  ) {
    const direction =
      getDirection(
        language
      );

    document.documentElement.setAttribute(
      "lang",
      language
    );

    document.documentElement.setAttribute(
      "dir",
      direction
    );

    if (document.body) {
      document.body.setAttribute(
        "dir",
        direction
      );
    }

    document.documentElement.classList.toggle(
      "is-rtl",
      direction === "rtl"
    );

    document.documentElement.classList.toggle(
      "is-ltr",
      direction === "ltr"
    );

    document.body?.classList.toggle(
      "is-rtl",
      direction === "rtl"
    );

    document.body?.classList.toggle(
      "is-ltr",
      direction === "ltr"
    );
  }

  /* =========================================
     LANGUAGE SWITCHER
  ========================================= */

  function updateLanguageSwitcher(
    language
  ) {
    document
      .querySelectorAll(
        "[data-language-option]"
      )
      .forEach(
        function (element) {
          const option =
            element.getAttribute(
              "data-language-option"
            );

          const active =
            option === language;

          element.classList.toggle(
            "active",
            active
          );

          element.setAttribute(
            "aria-selected",
            String(active)
          );

          element.setAttribute(
            "data-active",
            String(active)
          );
        }
      );

    document
      .querySelectorAll(
        "[data-language-switch]"
      )
      .forEach(
        function (element) {
          const target =
            element.getAttribute(
              "data-language-switch"
            );

          element.classList.toggle(
            "active",
            target === language
          );
        }
      );
  }

  /* =========================================
     FULL APPLICATION
  ========================================= */

  function applyLanguage(
    language =
      getCurrentLanguage()
  ) {
    if (
      !isSupportedLanguage(
        language
      )
    ) {
      language =
        DEFAULT_LANGUAGE;
    }

    applyDirection(
      language
    );

    applyTextTranslations(
      language
    );

    applyPlaceholderTranslations(
      language
    );

    applyValueTranslations(
      language
    );

    applyAccessibilityTranslations(
      language
    );

    applyDocumentTitle(
      language
    );

    updateLanguageSwitcher(
      language
    );

    try {
      localStorage.setItem(
        LANGUAGE_STORAGE_KEY,
        language
      );
    } catch (error) {
      console.warn(
        "Al-Dahayan Language: unable to save language preference."
      );
    }

    document.dispatchEvent(
      new CustomEvent(
        "alDahayanLanguageApplied",
        {
          detail: {
            language,
            direction:
              getDirection(
                language
              )
          }
        }
      )
    );

    return language;
  }

  /* =========================================
     SET LANGUAGE
  ========================================= */

  function setLanguage(
    language
  ) {
    if (
      !isSupportedLanguage(
        language
      )
    ) {
      return false;
    }

    const previousLanguage =
      getCurrentLanguage();

    applyLanguage(
      language
    );

    if (
      previousLanguage !==
      language
    ) {
      document.dispatchEvent(
        new CustomEvent(
          "alDahayanLanguageChanged",
          {
            detail: {
              previousLanguage,
              language,
              direction:
                getDirection(
                  language
                )
            }
          }
        )
      );
    }

    return true;
  }

  /* =========================================
     TOGGLE
  ========================================= */

  function toggleLanguage() {
    const current =
      getCurrentLanguage();

    const next =
      current === "en"
        ? "ar"
        : "en";

    return setLanguage(
      next
    );
  }

  /* =========================================
     SWITCHER EVENTS
  ========================================= */

  function initializeLanguageSwitcher() {
    document.addEventListener(
      "click",
      function (event) {
        const target =
          event.target.closest(
            "[data-language-switch]"
          );

        if (!target) {
          return;
        }

        event.preventDefault();

        const language =
          target.getAttribute(
            "data-language-switch"
          );

        setLanguage(
          language
        );
      }
    );

    document.addEventListener(
      "click",
      function (event) {
        const target =
          event.target.closest(
            "[data-language-option]"
          );

        if (!target) {
          return;
        }

        event.preventDefault();

        const language =
          target.getAttribute(
            "data-language-option"
          );

        setLanguage(
          language
        );
      }
    );
  }

  /* =========================================
     COMPONENT SYNC
  ========================================= */

  function initializeComponentLanguageSync() {
    document.addEventListener(
      "alDahayanComponentsLoaded",
      function () {
        applyLanguage(
          getCurrentLanguage()
        );
      }
    );
  }

  /* =========================================
     CONFIG SYNC
  ========================================= */

  function initializeConfigLanguageSync() {
    document.addEventListener(
      "alDahayanConfigUpdated",
      function () {
        applyLanguage(
          getCurrentLanguage()
        );
      }
    );

    window.addEventListener(
      "storage",
      function (event) {
        if (
          event.key ===
          LANGUAGE_STORAGE_KEY
        ) {
          applyLanguage(
            event.newValue ||
              DEFAULT_LANGUAGE
          );
        }
      }
    );
  }

  /* =========================================
     INITIALIZE
  ========================================= */

  let initialized =
    false;

  function initializeLanguage() {
    if (initialized) {
      return;
    }

    initialized = true;

    initializeLanguageSwitcher();

    initializeComponentLanguageSync();

    initializeConfigLanguageSync();

    applyLanguage(
      getCurrentLanguage()
    );

    document.dispatchEvent(
      new CustomEvent(
        "alDahayanLanguageReady",
        {
          detail: {
            language:
              getCurrentLanguage()
          }
        }
      )
    );
  }

  /* =========================================
     PUBLIC API
  ========================================= */

  window.AlDahayanLanguage = {

    initialize:
      initializeLanguage,

    init:
      initializeLanguage,

    apply:
      applyLanguage,

    set:
      setLanguage,

    get:
      getCurrentLanguage,

    getStored:
      getStoredLanguage,

    toggle:
      toggleLanguage,

    translate:
      translate,

    isSupported:
      isSupportedLanguage,

    getDirection:
      getDirection,

    supportedLanguages:
      [
        ...SUPPORTED_LANGUAGES
      ],

    translations:
      translations,

    isInitialized:
      function () {
        return initialized;
      }
  };

  /* =========================================
     BACKWARD COMPATIBILITY
  ========================================= */

  window.initializeLanguage =
    initializeLanguage;

  window.setLanguage =
    setLanguage;

  window.getCurrentLanguage =
    getCurrentLanguage;

  window.getStoredLanguage =
    getStoredLanguage;

  window.translate =
    translate;

  /* =========================================
     DOM READY
  ========================================= */

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      initializeLanguage,
      {
        once: true
      }
    );
  } else {
    initializeLanguage();
  }

})();
