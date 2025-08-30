import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import ContentManagement from '@/components/admin/ContentManagement';
import CoverageForm from '@/components/admin/CoverageForm';

const CoverageManagementPage = () => {
  const { t } = useTranslation();

  const columns = [
    { key: 'title', label: 'العنوان', type: 'excerpt' },
    { key: 'coverage_type', label: 'نوع التغطية', type: 'text' },
    { key: 'event_location', label: 'موقع الحدث', type: 'text' },
    { key: 'reporter_name', label: 'المراسل', type: 'text' },
    { key: 'event_date', label: 'تاريخ الحدث', type: 'date' },
    { key: 'status', label: 'الحالة', type: 'status' },
  ];

  return (
    <>
      <Helmet>
        <title>إدارة التغطيات - {t('siteName')}</title>
      </Helmet>
      <ContentManagement
        contentType="coverage"
        tableName="coverage"
        title="إدارة التغطيات"
        FormComponent={CoverageForm}
        columns={columns}
      />
    </>
  );
};

export default CoverageManagementPage;
