export default function SettingsSection() {
  const settingsGroups = [
    {
      title: "اطلاعات رستوران",
      items: [
        { label: "نام کسب‌وکار", value: "فلوروان ۲۱" },
        { label: "آدرس", value: "قزوین، محمدیه، کاج ۱۹" },
        { label: "ساعت کاری", value: "۱۰ صبح تا ۱۲ شب" },
      ],
    },
    {
      title: "اعلان‌ها",
      items: [
        { label: "صدای سفارش جدید", value: "فعال" },
        { label: "اعلان میز نیازمند نظافت", value: "فعال" },
      ],
    },
    {
      title: "سیستم",
      items: [
        { label: "نسخه پنل", value: "۱.۰.۰" },
        { label: "زبان رابط", value: "فارسی" },
      ],
    },
  ];

  return (
    <section className="admin-section">
      <span className="admin-section-bar" />

      {settingsGroups.map((group) => (
        <div key={group.title} className="admin-card settings-card">
          <h3 className="admin-card-title">{group.title}</h3>
          <ul className="settings-list">
            {group.items.map((item) => (
              <li key={item.label} className="settings-item">
                <span className="settings-label">{item.label}</span>
                <span className="settings-value">{item.value}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <p className="orders-note">تنظیمات قابل ویرایش در مرحله بعد فعال می‌شوند.</p>
    </section>
  );
}
