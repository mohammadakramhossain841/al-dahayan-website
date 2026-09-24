/* =========================================  
   AL-DAHAYAN LANGUAGE SYSTEM  
   English / Arabic  
========================================= */  
  
(function () {  
  "use strict";  
  
  const LANGUAGE_STORAGE_KEY =  
    "alDahayanLanguage";  
  
  const DEFAULT_LANGUAGE = "en";  
  
  const SUPPORTED_LANGUAGES = ["en", "ar"];  
  
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
      close: "Close",  
      cancel: "Cancel",  
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
  
      unknown:  
        "Unknown",  
  
      quantity:  
        "Quantity",  
  
      availableQuantity:  
        "Available Quantity",  
  
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
  
      dataLoading:  
        "Loading data...",  
  
      dataLoadError:  
        "Unable to load data.",  
  
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
        "Customer Inquiry | Al-Dahayan"  
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
      close: "إغلاق",  
      cancel: "إلغاء",  
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
  
      unknown:  
        "غير معروف",  
  
      quantity:  
        "الكمية",  
  
      availableQuantity:  
        "الكمية المتوفرة",  
  
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
  
      /* Empty / Error */  
  
      noPartsFound:  
        "لم يتم العثور على قطع غيار.",  
  
      noVehiclesFound:  
        "لم يتم العثور على مركبات.",  
  
      noInventoryFound:  
        "لم يتم العثور على سجلات مخزون.",  
  
      noCompatibleParts:  
        "لم يتم العثور على قطع متوافقة.",  
  
      dataLoading:  
        "جارٍ تحميل البيانات...",  
  
      dataLoadError:  
        "تعذر تحميل البيانات.",  
  
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
        "استفسار العميل | الضحيان"  
    }  
  };  
  
  /* =========================================  
     Utility  
  ========================================= */  
  
  function isSupportedLanguage(language) {  
    return SUPPORTED_LANGUAGES.includes(  
      language  
    );  
  }  
  
  function getStoredLanguage() {  
    const stored =  
      localStorage.getItem(  
        LANGUAGE_STORAGE_KEY  
      );  
  
    return isSupportedLanguage(stored)  
      ? stored  
      : null;  
  }  
  
  function getCurrentLanguage() {  
    const htmlLanguage =  
      document.documentElement.getAttribute(  
        "lang"  
      );  
  
    if (isSupportedLanguage(htmlLanguage)) {  
      return htmlLanguage;  
    }  
  
    const storedLanguage =  
      getStoredLanguage();  
  
    if (storedLanguage) {  
      return storedLanguage;  
    }  
  
    return DEFAULT_LANGUAGE;  
  }  
  
  function getDirection(language) {  
    return language === "ar"  
      ? "rtl"  
      : "ltr";  
  }  
  
  /* =========================================  
     Translation  
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
      translations[DEFAULT_LANGUAGE] || {};  
  
    return (  
      selected[key] ??  
      fallback[key] ??  
      key  
    );  
  }  
  
  /* =========================================  
     Apply Text Translation  
  ========================================= */  
  
  function applyTextTranslations(  
    language  
  ) {  
    document  
      .querySelectorAll("[data-i18n]")  
      .forEach((element) => {  
        const key =  
          element.getAttribute(  
            "data-i18n"  
          );  
  
        if (!key) {  
          return;  
        }  
  
        element.textContent =  
          translate(key, language);  
      });  
  }  
  
  /* =========================================  
     Placeholder Translation  
  ========================================= */  
  
  function applyPlaceholderTranslations(  
    language  
  ) {  
    document  
      .querySelectorAll(  
        "[data-i18n-placeholder]"  
      )  
      .forEach((element) => {  
        const key =  
          element.getAttribute(  
            "data-i18n-placeholder"  
          );  
  
        if (!key) {  
          return;  
        }  
  
        element.setAttribute(  
          "placeholder",  
          translate(key, language)  
        );  
      });  
  }  
  
  /* =========================================  
     Title Translation  
  ========================================= */  
  
  function getPageTitleKey() {  
    const page =  
      document.body?.dataset?.page ||  
      "";  
  
    const pageMap = {  
      home: "pageTitleHome",  
      about: "pageTitleAbout",  
      parts: "pageTitleParts",  
      vehicles: "pageTitleVehicles",  
      "vin-search": "pageTitleVIN",  
      inventory: "pageTitleInventory",  
      services: "pageTitleServices",  
      contact: "pageTitleContact",  
      inquiry: "pageTitleInquiry"  
    };  
  
    return pageMap[page] || null;  
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
     Accessibility Labels  
  ========================================= */  
  
  function applyAccessibilityTranslations(  
    language  
  ) {  
    document  
      .querySelectorAll(  
        "[data-i18n-aria-label]"  
      )  
      .forEach((element) => {  
        const key =  
          element.getAttribute(  
            "data-i18n-aria-label"  
          );  
  
        if (!key) {  
          return;  
        }  
  
        element.setAttribute(  
          "aria-label",  
          translate(key, language)  
        );  
      });  
  
    document  
      .querySelectorAll(  
        "[data-i18n-title]"  
      )  
      .forEach((element) => {  
        const key =  
          element.getAttribute(  
            "data-i18n-title"  
          );  
  
        if (!key) {  
          return;  
        }  
  
        element.setAttribute(  
          "title",  
          translate(key, language)  
        );  
      });  
  }  
  
  /* =========================================  
     HTML Direction  
  ========================================= */  
  
  function applyDirection(  
    language  
  ) {  
    const direction =  
      getDirection(language);  
  
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
  }  
  
  /* =========================================  
     Language Switcher UI  
  ========================================= */  
  
  function updateLanguageSwitcher(  
    language  
  ) {  
    document  
      .querySelectorAll(  
        "[data-language-option]"  
      )  
      .forEach((element) => {  
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
      });  
  
    document  
      .querySelectorAll(  
        "[data-language-switch]"  
      )  
      .forEach((element) => {  
        const target =  
          element.getAttribute(  
            "data-language-switch"  
          );  
  
        if (target === language) {  
          element.classList.add("active");  
        } else {  
          element.classList.remove(  
            "active"  
          );  
        }  
      });  
  }  
  
  /* =========================================  
     Full Language Application  
  ========================================= */  
  
  function applyLanguage(  
    language = getCurrentLanguage()  
  ) {  
    if (!isSupportedLanguage(language)) {  
      language = DEFAULT_LANGUAGE;  
    }  
  
    applyDirection(language);  
  
    applyTextTranslations(language);  
  
    applyPlaceholderTranslations(  
      language  
    );  
  
    applyAccessibilityTranslations(  
      language  
    );  
  
    applyDocumentTitle(language);  
  
    updateLanguageSwitcher(language);  
  
    localStorage.setItem(  
      LANGUAGE_STORAGE_KEY,  
      language  
    );  
  
    document.dispatchEvent(  
      new CustomEvent(  
        "alDahayanLanguageApplied",  
        {  
          detail: {  
            language: language,  
            direction:  
              getDirection(language)  
          }  
        }  
      )  
    );  
  
    return language;  
  }  
  
  /* =========================================  
     Set Language  
  ========================================= */  
  
  function setLanguage(language) {  
    if (!isSupportedLanguage(language)) {  
      return false;  
    }  
  
    const previousLanguage =  
      getCurrentLanguage();  
  
    applyLanguage(language);  
  
    document.dispatchEvent(  
      new CustomEvent(  
        "alDahayanLanguageChanged",  
        {  
          detail: {  
            previousLanguage:  
              previousLanguage,  
            language: language,  
            direction:  
              getDirection(language)  
          }  
        }  
      )  
    );  
  
    return true;  
  }  
  
  /* =========================================  
     Toggle Language  
  ========================================= */  
  
  function toggleLanguage() {  
    const current =  
      getCurrentLanguage();  
  
    const next =  
      current === "en"  
        ? "ar"  
        : "en";  
  
    return setLanguage(next);  
  }  
  
  /* =========================================  
     Language Switcher Events  
  ========================================= */  
  
  function initializeLanguageSwitcher() {  
    document.addEventListener(  
      "click",  
      (event) => {  
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
  
        setLanguage(language);  
      }  
    );  
  
    document.addEventListener(  
      "click",  
      (event) => {  
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
  
        setLanguage(language);  
      }  
    );  
  }  
  
  /* =========================================  
     Re-Apply After Components Load  
  ========================================= */  
  
  function initializeComponentLanguageSync() {  
    document.addEventListener(  
      "alDahayanComponentsLoaded",  
      () => {  
        applyLanguage(  
          getCurrentLanguage()  
        );  
      }  
    );  
  }  
  
  /* =========================================  
     Initialize  
  ========================================= */  
  
  let initialized = false;  
  
  function initializeLanguage() {  
    if (initialized) {  
      return;  
    }  
  
    initialized = true;  
  
    initializeLanguageSwitcher();  
  
    initializeComponentLanguageSync();  
  
    applyLanguage(  
      getCurrentLanguage()  
    );  
  }  
  
  /* =========================================  
     Public API  
  ========================================= */  
  
  window.AlDahayanLanguage = {  
    initialize:  
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
      [...SUPPORTED_LANGUAGES],  
  
    translations:  
      translations  
  };  
  
  /*  
   * Backward-compatible global functions  
   */  
  
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
     DOM Ready  
  ========================================= */  
  
  document.addEventListener(  
    "DOMContentLoaded",  
    () => {  
      initializeLanguage();  
    }  
  );  
  
})();  
