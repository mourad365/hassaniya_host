import React from 'react';
import { Helmet } from 'react-helmet-async';
import ContactsManagement from '@/components/admin/ContactsManagement';

const ContactsPage = () => {
  return (
    <>
      <Helmet>
        <title>إدارة الرسائل والاتصال - لوحة التحكم</title>
        <meta name="description" content="إدارة رسائل الزوار والاستفسارات في لوحة التحكم" />
      </Helmet>
      
      {/* AdminLayout is already applied in App.jsx for /admin routes. */}
      <ContactsManagement />
    </>
  );
};

export default ContactsPage;
