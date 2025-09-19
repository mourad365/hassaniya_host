import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Clock, Eye, EyeOff, Trash2, User, MessageSquare, Calendar, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const ContactsManagement = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all'); // all, new, read, replied

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في تحميل الرسائل",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const updateContactStatus = async (contactId, newStatus) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .update({ status: newStatus })
        .eq('id', contactId);

      if (error) throw error;

      setContacts(contacts.map(contact => 
        contact.id === contactId 
          ? { ...contact, status: newStatus }
          : contact
      ));

      toast({
        title: "تم التحديث",
        description: "تم تحديث حالة الرسالة بنجاح",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في تحديث حالة الرسالة",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const deleteContact = async (contactId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الرسالة؟')) return;

    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', contactId);

      if (error) throw error;

      setContacts(contacts.filter(contact => contact.id !== contactId));
      if (selectedContact?.id === contactId) {
        setSelectedContact(null);
      }

      toast({
        title: "تم الحذف",
        description: "تم حذف الرسالة بنجاح",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في حذف الرسالة",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleContactClick = (contact) => {
    setSelectedContact(contact);
    if (contact.status === 'new') {
      updateContactStatus(contact.id, 'read');
    }
  };

  const filteredContacts = statusFilter === 'all' 
    ? contacts 
    : contacts.filter(contact => contact.status === statusFilter);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'new': return <Mail className="text-blue-500" size={16} />;
      case 'read': return <Eye className="text-yellow-500" size={16} />;
      case 'replied': return <Check className="text-green-500" size={16} />;
      default: return <Mail className="text-gray-500" size={16} />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'new': return 'جديدة';
      case 'read': return 'مقروءة';
      case 'replied': return 'تم الرد';
      default: return 'غير محدد';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--heritage-gold)] mx-auto mb-4"></div>
          <p className="text-[var(--deep-brown)] arabic-body">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold arabic-title text-[var(--tent-black)] mb-2">
              إدارة الرسائل والاتصال
            </h1>
            <p className="text-[var(--deep-brown)] arabic-body">
              عرض وإدارة رسائل الزوار والاستفسارات
            </p>
          </div>
          
          {/* Status Filter */}
          <div className="flex gap-2 mt-4 lg:mt-0">
            {[
              { key: 'all', label: 'الكل', count: contacts.length },
              { key: 'new', label: 'الجديدة', count: contacts.filter(c => c.status === 'new').length },
              { key: 'read', label: 'المقروءة', count: contacts.filter(c => c.status === 'read').length },
              { key: 'replied', label: 'تم الرد', count: contacts.filter(c => c.status === 'replied').length }
            ].map(filter => (
              <button
                key={filter.key}
                onClick={() => setStatusFilter(filter.key)}
                className={`px-4 py-2 rounded-lg transition-colors modern-font text-sm ${
                  statusFilter === filter.key
                    ? 'bg-[var(--heritage-gold)] text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contacts List */}
          <div className="lg:col-span-1">
            <div className="heritage-card p-0 max-h-[600px] overflow-y-auto">
              {filteredContacts.length === 0 ? (
                <div className="p-6 text-center text-[var(--deep-brown)] arabic-body">
                  لا توجد رسائل
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredContacts.map((contact) => (
                    <div
                      key={contact.id}
                      onClick={() => handleContactClick(contact)}
                      className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                        selectedContact?.id === contact.id ? 'bg-blue-50' : ''
                      } ${contact.status === 'new' ? 'border-r-4 border-blue-500' : ''}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(contact.status)}
                          <h3 className="font-bold arabic-title text-sm text-[var(--tent-black)] truncate">
                            {contact.name}
                          </h3>
                        </div>
                        <span className="text-xs text-gray-500 modern-font">
                          {getStatusText(contact.status)}
                        </span>
                      </div>
                      
                      <p className="text-sm arabic-body text-[var(--deep-brown)] mb-2 truncate">
                        {contact.subject}
                      </p>
                      
                      <p className="text-xs text-gray-500 arabic-body truncate mb-2">
                        {contact.message.substring(0, 60)}...
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span className="modern-font">{contact.email}</span>
                        <span className="modern-font">{formatDate(contact.created_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Contact Detail */}
          <div className="lg:col-span-2">
            {selectedContact ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="heritage-card"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(selectedContact.status)}
                    <div>
                      <h2 className="text-2xl font-bold arabic-title text-[var(--tent-black)]">
                        {selectedContact.subject}
                      </h2>
                      <p className="text-sm text-[var(--deep-brown)] modern-font">
                        من: {selectedContact.name}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => updateContactStatus(selectedContact.id, 
                        selectedContact.status === 'replied' ? 'read' : 'replied'
                      )}
                      size="sm"
                      className={`modern-font ${
                        selectedContact.status === 'replied' 
                          ? 'bg-gray-500 hover:bg-gray-600' 
                          : 'bg-green-500 hover:bg-green-600'
                      }`}
                    >
                      {selectedContact.status === 'replied' ? 'إلغاء الرد' : 'تم الرد'}
                    </Button>
                    <Button
                      onClick={() => deleteContact(selectedContact.id)}
                      size="sm"
                      variant="destructive"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm text-[var(--deep-brown)]">
                      <User size={16} />
                      <span className="modern-font">{selectedContact.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[var(--deep-brown)]">
                      <Mail size={16} />
                      <span className="modern-font">{selectedContact.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[var(--deep-brown)]">
                      <Calendar size={16} />
                      <span className="modern-font">{formatDate(selectedContact.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[var(--deep-brown)]">
                      <MessageSquare size={16} />
                      <span className="modern-font">{getStatusText(selectedContact.status)}</span>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="font-bold arabic-title text-[var(--tent-black)] mb-3">نص الرسالة:</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="arabic-body text-[var(--deep-brown)] leading-relaxed whitespace-pre-wrap">
                        {selectedContact.message}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="font-bold arabic-title text-[var(--tent-black)] mb-3">الرد على الرسالة:</h3>
                    <p className="text-sm text-[var(--deep-brown)] arabic-body mb-3">
                      يمكنك الرد على هذه الرسالة عبر البريد الإلكتروني: 
                      <a 
                        href={`mailto:${selectedContact.email}?subject=Re: ${selectedContact.subject}`}
                        className="text-blue-500 hover:text-blue-700 underline mr-2"
                      >
                        {selectedContact.email}
                      </a>
                    </p>
                    <Button
                      onClick={() => window.open(`mailto:${selectedContact.email}?subject=Re: ${selectedContact.subject}`, '_blank')}
                      className="bg-[var(--oasis-blue)] hover:bg-blue-600 modern-font"
                    >
                      فتح البريد الإلكتروني
                    </Button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="heritage-card flex items-center justify-center h-96">
                <div className="text-center text-[var(--deep-brown)]">
                  <MessageSquare size={64} className="mx-auto mb-4 text-gray-400" />
                  <p className="arabic-body">اختر رسالة لعرض التفاصيل</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ContactsManagement;
