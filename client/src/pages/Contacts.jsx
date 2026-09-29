import React, { useEffect, useState } from 'react';
import { getContacts, createContact, updateContact, deleteContact, getDeals } from '../services/api';
import { Users, Mail, Phone, Building2, Plus, Search, Edit2, Trash2, X, Briefcase, MapPin, Globe, Info } from 'lucide-react';

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add', 'edit', 'view'
  const [currentContact, setCurrentContact] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    jobTitle: '',
    department: '',
    linkedin: '',
    location: '',
    notes: '',
    contactType: 'Other'
  });
  
  const [formErrors, setFormErrors] = useState({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const [contactsData, dealsData] = await Promise.all([
        getContacts(),
        getDeals()
      ]);
      setContacts(contactsData);
      setDeals(dealsData);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Get unique companies for the dropdown
  const uniqueCompanies = [...new Set(deals.map(d => d.company))].filter(Boolean);

  const openAddModal = () => {
    setModalMode('add');
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      jobTitle: '',
      department: '',
      linkedin: '',
      location: '',
      notes: '',
      contactType: 'Other'
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (contact) => {
    setModalMode('edit');
    setCurrentContact(contact);
    setFormData({
      name: contact.name || '',
      email: contact.email || '',
      phone: contact.phone || '',
      company: contact.company || '',
      jobTitle: contact.jobTitle || '',
      department: contact.department || '',
      linkedin: contact.linkedin || '',
      location: contact.location || '',
      notes: contact.notes || '',
      contactType: contact.contactType || 'Other'
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openViewModal = (contact) => {
    setModalMode('view');
    setCurrentContact(contact);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setCurrentContact(null);
    }, 200);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Full name is required';
    if (!formData.company.trim()) errors.company = 'Company is required';
    
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    
    if (formData.phone && !/^[\d\s\+\-\(\)]+$/.test(formData.phone)) {
      errors.phone = 'Invalid phone format';
    }
    
    if (formData.linkedin && !formData.linkedin.includes('linkedin.com/')) {
      errors.linkedin = 'Must be a valid LinkedIn URL';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSaving(true);
    try {
      if (modalMode === 'add') {
        const newContact = await createContact(formData);
        setContacts([newContact, ...contacts]);
      } else if (modalMode === 'edit') {
        const updated = await updateContact(currentContact._id, formData);
        setContacts(contacts.map(c => c._id === updated._id ? updated : c));
        setCurrentContact(updated);
        // If we want to stay in view mode after edit:
        setModalMode('view');
        setIsSaving(false);
        return; 
      }
      closeModal();
    } catch (err) {
      console.error(err);
      setFormErrors({ submit: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this contact?')) return;
    
    setIsDeleting(true);
    try {
      await deleteContact(currentContact._id);
      setContacts(contacts.filter(c => c._id !== currentContact._id));
      closeModal();
    } catch (err) {
      console.error(err);
      alert('Failed to delete contact: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredContacts = contacts.filter(c => {
    const q = searchQuery.toLowerCase();
    return (
      (c.name || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.company || '').toLowerCase().includes(q) ||
      (c.phone || '').toLowerCase().includes(q)
    );
  });

  if (loading) return <div className="p-8 text-slate-500">Loading contacts...</div>;
  if (error) return (
    <div className="p-8 text-slate-900">
      <div className="text-red-500 font-bold mb-2">Unable to load contacts.</div>
      <div>{error}</div>
      <button onClick={fetchData} className="mt-4 px-4 py-2 bg-brand-500 text-slate-900 rounded">Retry</button>
    </div>
  );

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-slate-900">Contacts</h1>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-slate-900 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Contact
        </button>
      </div>

      {contacts.length > 0 && (
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text"
            placeholder="Search contacts by name, email, or company..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 clean-card border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-400 outline-none"
          />
        </div>
      )}
      
      {contacts.length === 0 ? (
        <div className="p-12 clean-card rounded-xl shadow-sm border border-slate-200 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-slate-500" />
          </div>
          <h2 className="text-xl font-semibold text-slate-700">No contacts yet</h2>
          <p className="text-slate-500 mt-2 max-w-md mx-auto mb-6">
            Keep track of all your stakeholders, champions, and decision makers across your deals.
          </p>
          <button 
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-brand-50 hover:bg-brand-100 text-brand-400 rounded-lg font-medium transition-colors mx-auto"
          >
            <Plus className="w-5 h-5" />
            Add Contact
          </button>
        </div>
      ) : filteredContacts.length === 0 ? (
        <div className="p-8 text-center text-slate-500 clean-card rounded-xl border border-slate-200">
          No contacts found matching "{searchQuery}"
        </div>
      ) : (
        <div className="clean-card rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-sm text-slate-500 font-medium">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Company</th>
                  <th className="px-6 py-4">Contact Info</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredContacts.map(contact => (
                  <tr key={contact._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{contact.name}</div>
                      {contact.jobTitle && <div className="text-sm text-slate-500">{contact.jobTitle}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-700">
                        <Building2 className="w-4 h-4 text-slate-500" />
                        {contact.company}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-sm text-slate-500">
                        {contact.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-slate-500" />
                            <a href={`mailto:${contact.email}`} className="hover:text-brand-500">{contact.email}</a>
                          </div>
                        )}
                        {contact.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-slate-500" />
                            <span>{contact.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-brand-50 text-brand-300 text-xs font-medium rounded-full">
                        {contact.contactType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openViewModal(contact)}
                          className="p-2 text-slate-500 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-colors"
                          title="View Contact"
                        >
                          <Info className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => openEditModal(contact)}
                          className="p-2 text-slate-500 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-colors"
                          title="Edit Contact"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="clean-card rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
              <h2 className="text-xl font-bold text-slate-900">
                {modalMode === 'add' ? 'Add Contact' : modalMode === 'edit' ? 'Edit Contact' : 'Contact Details'}
              </h2>
              <div className="flex items-center gap-2">
                {modalMode === 'view' && (
                  <>
                    <button 
                      onClick={() => setModalMode('edit')}
                      className="p-2 text-slate-500 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </>
                )}
                <button onClick={closeModal} className="text-slate-500 hover:text-slate-500">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {modalMode === 'view' && currentContact ? (
              <div className="p-6 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-brand-100 text-brand-400 rounded-full flex items-center justify-center text-2xl font-bold">
                    {currentContact.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">{currentContact.name}</h3>
                    <p className="text-slate-500 flex items-center gap-2">
                      <Briefcase className="w-4 h-4" /> 
                      {currentContact.jobTitle || 'No Title'} {currentContact.department ? `• ${currentContact.department}` : ''}
                    </p>
                    <span className="inline-block mt-2 px-2.5 py-1 bg-brand-50 text-brand-300 text-xs font-medium rounded-full">
                      {currentContact.contactType}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
                  <div className="space-y-4">
                    <div>
                      <span className="text-xs font-semibold text-slate-500 uppercase">Company</span>
                      <div className="flex items-center gap-2 mt-1 text-slate-700">
                        <Building2 className="w-4 h-4 text-slate-500" />
                        {currentContact.company}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-500 uppercase">Email</span>
                      <div className="flex items-center gap-2 mt-1 text-slate-700">
                        <Mail className="w-4 h-4 text-slate-500" />
                        {currentContact.email || '-'}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-500 uppercase">Phone</span>
                      <div className="flex items-center gap-2 mt-1 text-slate-700">
                        <Phone className="w-4 h-4 text-slate-500" />
                        {currentContact.phone || '-'}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <span className="text-xs font-semibold text-slate-500 uppercase">Location</span>
                      <div className="flex items-center gap-2 mt-1 text-slate-700">
                        <MapPin className="w-4 h-4 text-slate-500" />
                        {currentContact.location || '-'}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-500 uppercase">LinkedIn</span>
                      <div className="flex items-center gap-2 mt-1 text-slate-700">
                        <Globe className="w-4 h-4 text-slate-500" />
                        {currentContact.linkedin ? (
                          <a href={currentContact.linkedin} target="_blank" rel="noreferrer" className="text-brand-500 hover:underline break-all">
                            {currentContact.linkedin}
                          </a>
                        ) : '-'}
                      </div>
                    </div>
                  </div>
                </div>

                {currentContact.notes && (
                  <div className="pt-6 border-t border-slate-100">
                    <span className="text-xs font-semibold text-slate-500 uppercase">Notes</span>
                    <p className="mt-2 text-slate-700 whitespace-pre-wrap">{currentContact.notes}</p>
                  </div>
                )}
                
                <div className="pt-4 text-xs text-slate-500 text-right">
                  Added: {new Date(currentContact.createdAt).toLocaleDateString()}
                </div>
              </div>
            ) : (
              <div className="p-6">
                {formErrors.submit && (
                  <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                    {formErrors.submit}
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                      <input 
                        type="text" 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-400 outline-none ${formErrors.name ? 'border-red-300' : 'border-slate-200'}`}
                      />
                      {formErrors.name && <span className="text-xs text-red-500">{formErrors.name}</span>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Company *</label>
                      <input 
                        type="text" 
                        list="companies-list"
                        value={formData.company}
                        onChange={e => setFormData({...formData, company: e.target.value})}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-400 outline-none ${formErrors.company ? 'border-red-300' : 'border-slate-200'}`}
                      />
                      <datalist id="companies-list">
                        {uniqueCompanies.map(c => <option key={c} value={c} />)}
                      </datalist>
                      {formErrors.company && <span className="text-xs text-red-500">{formErrors.company}</span>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                      <input 
                        type="email" 
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-400 outline-none ${formErrors.email ? 'border-red-300' : 'border-slate-200'}`}
                      />
                      {formErrors.email && <span className="text-xs text-red-500">{formErrors.email}</span>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                      <input 
                        type="tel" 
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-400 outline-none ${formErrors.phone ? 'border-red-300' : 'border-slate-200'}`}
                      />
                      {formErrors.phone && <span className="text-xs text-red-500">{formErrors.phone}</span>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Job Title</label>
                      <input 
                        type="text" 
                        value={formData.jobTitle}
                        onChange={e => setFormData({...formData, jobTitle: e.target.value})}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-400 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                      <input 
                        type="text" 
                        value={formData.department}
                        onChange={e => setFormData({...formData, department: e.target.value})}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-400 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Contact Type</label>
                      <select 
                        value={formData.contactType}
                        onChange={e => setFormData({...formData, contactType: e.target.value})}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-400 outline-none clean-card"
                      >
                        <option value="Decision Maker">Decision Maker</option>
                        <option value="Influencer">Influencer</option>
                        <option value="Champion">Champion</option>
                        <option value="Procurement">Procurement</option>
                        <option value="Technical">Technical</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">LinkedIn URL</label>
                      <input 
                        type="url" 
                        value={formData.linkedin}
                        onChange={e => setFormData({...formData, linkedin: e.target.value})}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-400 outline-none ${formErrors.linkedin ? 'border-red-300' : 'border-slate-200'}`}
                        placeholder="https://linkedin.com/in/..."
                      />
                      {formErrors.linkedin && <span className="text-xs text-red-500">{formErrors.linkedin}</span>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                      <input 
                        type="text" 
                        value={formData.location}
                        onChange={e => setFormData({...formData, location: e.target.value})}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-400 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                    <textarea 
                      value={formData.notes}
                      onChange={e => setFormData({...formData, notes: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-400 outline-none resize-none"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <button 
                      type="button"
                      onClick={closeModal}
                      className="px-6 py-2 text-slate-500 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={isSaving}
                      className="px-6 py-2 bg-brand-500 hover:bg-brand-600 text-slate-900 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      {isSaving ? 'Saving...' : 'Save Contact'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


