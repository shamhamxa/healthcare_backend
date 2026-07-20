--
-- PostgreSQL database dump
--

\restrict Tc6DGkVL0tRfx4sdjP6rWPUYABgNo1fiklte5MiJu83l2sUWz9mVdMWW1jzroRo

-- Dumped from database version 15.17 (Homebrew)
-- Dumped by pg_dump version 15.17 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: activity_logs; Type: TABLE; Schema: public; Owner: hamza-nsd
--

CREATE TABLE public.activity_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE public.activity_logs OWNER TO "hamza-nsd";

--
-- Name: ai_consultation_logs; Type: TABLE; Schema: public; Owner: hamza-nsd
--

CREATE TABLE public.ai_consultation_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE public.ai_consultation_logs OWNER TO "hamza-nsd";

--
-- Name: appointments; Type: TABLE; Schema: public; Owner: hamza-nsd
--

CREATE TABLE public.appointments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    visit_id uuid,
    patient_id uuid,
    service_id uuid
);


ALTER TABLE public.appointments OWNER TO "hamza-nsd";

--
-- Name: assistant_assessments; Type: TABLE; Schema: public; Owner: hamza-nsd
--

CREATE TABLE public.assistant_assessments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    visit_id uuid,
    assessment_data jsonb DEFAULT '{}'::jsonb
);


ALTER TABLE public.assistant_assessments OWNER TO "hamza-nsd";

--
-- Name: attachment_categories; Type: TABLE; Schema: public; Owner: hamza-nsd
--

CREATE TABLE public.attachment_categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE public.attachment_categories OWNER TO "hamza-nsd";

--
-- Name: attachments; Type: TABLE; Schema: public; Owner: hamza-nsd
--

CREATE TABLE public.attachments (
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE public.attachments OWNER TO "hamza-nsd";

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: hamza-nsd
--

CREATE TABLE public.audit_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE public.audit_logs OWNER TO "hamza-nsd";

--
-- Name: clinic_holidays; Type: TABLE; Schema: public; Owner: hamza-nsd
--

CREATE TABLE public.clinic_holidays (
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE public.clinic_holidays OWNER TO "hamza-nsd";

--
-- Name: clinics; Type: TABLE; Schema: public; Owner: hamza-nsd
--

CREATE TABLE public.clinics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(200),
    status character varying(20) DEFAULT 'ACTIVE'::character varying
);


ALTER TABLE public.clinics OWNER TO "hamza-nsd";

--
-- Name: consultation_notes; Type: TABLE; Schema: public; Owner: hamza-nsd
--

CREATE TABLE public.consultation_notes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    visit_id uuid,
    provider_id uuid,
    consultation_data jsonb DEFAULT '{}'::jsonb
);


ALTER TABLE public.consultation_notes OWNER TO "hamza-nsd";

--
-- Name: diagnoses; Type: TABLE; Schema: public; Owner: hamza-nsd
--

CREATE TABLE public.diagnoses (
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE public.diagnoses OWNER TO "hamza-nsd";

--
-- Name: diagnosis_templates; Type: TABLE; Schema: public; Owner: hamza-nsd
--

CREATE TABLE public.diagnosis_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE public.diagnosis_templates OWNER TO "hamza-nsd";

--
-- Name: doctor_favourites; Type: TABLE; Schema: public; Owner: hamza-nsd
--

CREATE TABLE public.doctor_favourites (
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE public.doctor_favourites OWNER TO "hamza-nsd";

--
-- Name: doctor_schedules; Type: TABLE; Schema: public; Owner: hamza-nsd
--

CREATE TABLE public.doctor_schedules (
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE public.doctor_schedules OWNER TO "hamza-nsd";

--
-- Name: follow_ups; Type: TABLE; Schema: public; Owner: hamza-nsd
--

CREATE TABLE public.follow_ups (
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE public.follow_ups OWNER TO "hamza-nsd";

--
-- Name: invoice_items; Type: TABLE; Schema: public; Owner: hamza-nsd
--

CREATE TABLE public.invoice_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE public.invoice_items OWNER TO "hamza-nsd";

--
-- Name: invoices; Type: TABLE; Schema: public; Owner: hamza-nsd
--

CREATE TABLE public.invoices (
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE public.invoices OWNER TO "hamza-nsd";

--
-- Name: lab_orders; Type: TABLE; Schema: public; Owner: hamza-nsd
--

CREATE TABLE public.lab_orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE public.lab_orders OWNER TO "hamza-nsd";

--
-- Name: lab_results; Type: TABLE; Schema: public; Owner: hamza-nsd
--

CREATE TABLE public.lab_results (
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE public.lab_results OWNER TO "hamza-nsd";

--
-- Name: medicine_templates; Type: TABLE; Schema: public; Owner: hamza-nsd
--

CREATE TABLE public.medicine_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE public.medicine_templates OWNER TO "hamza-nsd";

--
-- Name: medicines; Type: TABLE; Schema: public; Owner: hamza-nsd
--

CREATE TABLE public.medicines (
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE public.medicines OWNER TO "hamza-nsd";

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: hamza-nsd
--

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE public.notifications OWNER TO "hamza-nsd";

--
-- Name: patient_allergies; Type: TABLE; Schema: public; Owner: hamza-nsd
--

CREATE TABLE public.patient_allergies (
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE public.patient_allergies OWNER TO "hamza-nsd";

--
-- Name: patient_conditions; Type: TABLE; Schema: public; Owner: hamza-nsd
--

CREATE TABLE public.patient_conditions (
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE public.patient_conditions OWNER TO "hamza-nsd";

--
-- Name: patient_contacts; Type: TABLE; Schema: public; Owner: hamza-nsd
--

CREATE TABLE public.patient_contacts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    clinic_id uuid,
    primary_mobile character varying(20),
    primary_cnic character varying(20),
    address text
);


ALTER TABLE public.patient_contacts OWNER TO "hamza-nsd";

--
-- Name: patient_documents; Type: TABLE; Schema: public; Owner: hamza-nsd
--

CREATE TABLE public.patient_documents (
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE public.patient_documents OWNER TO "hamza-nsd";

--
-- Name: patient_family; Type: TABLE; Schema: public; Owner: hamza-nsd
--

CREATE TABLE public.patient_family (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    patient_id uuid NOT NULL,
    related_patient_id uuid NOT NULL,
    relationship character varying(50) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.patient_family OWNER TO "hamza-nsd";

--
-- Name: patient_flags; Type: TABLE; Schema: public; Owner: hamza-nsd
--

CREATE TABLE public.patient_flags (
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE public.patient_flags OWNER TO "hamza-nsd";

--
-- Name: patient_identifiers; Type: TABLE; Schema: public; Owner: hamza-nsd
--

CREATE TABLE public.patient_identifiers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    patient_id uuid NOT NULL,
    identifier_type character varying(30) NOT NULL,
    identifier_value character varying(100) NOT NULL,
    is_primary boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.patient_identifiers OWNER TO "hamza-nsd";

--
-- Name: patients; Type: TABLE; Schema: public; Owner: hamza-nsd
--

CREATE TABLE public.patients (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    clinic_id uuid,
    contact_profile_id uuid,
    patient_code character varying(50),
    first_name character varying(100),
    last_name character varying(100),
    gender character varying(20),
    date_of_birth date,
    status character varying(20) DEFAULT 'ACTIVE'::character varying
);


ALTER TABLE public.patients OWNER TO "hamza-nsd";

--
-- Name: payments; Type: TABLE; Schema: public; Owner: hamza-nsd
--

CREATE TABLE public.payments (
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE public.payments OWNER TO "hamza-nsd";

--
-- Name: permissions; Type: TABLE; Schema: public; Owner: hamza-nsd
--

CREATE TABLE public.permissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE public.permissions OWNER TO "hamza-nsd";

--
-- Name: prescription_items; Type: TABLE; Schema: public; Owner: hamza-nsd
--

CREATE TABLE public.prescription_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE public.prescription_items OWNER TO "hamza-nsd";

--
-- Name: prescription_templates; Type: TABLE; Schema: public; Owner: hamza-nsd
--

CREATE TABLE public.prescription_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE public.prescription_templates OWNER TO "hamza-nsd";

--
-- Name: prescriptions; Type: TABLE; Schema: public; Owner: hamza-nsd
--

CREATE TABLE public.prescriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    visit_id uuid,
    metadata jsonb DEFAULT '{}'::jsonb
);


ALTER TABLE public.prescriptions OWNER TO "hamza-nsd";

--
-- Name: provider_services; Type: TABLE; Schema: public; Owner: hamza-nsd
--

CREATE TABLE public.provider_services (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    provider_id uuid NOT NULL,
    service_id uuid NOT NULL,
    is_primary boolean DEFAULT false
);


ALTER TABLE public.provider_services OWNER TO "hamza-nsd";

--
-- Name: providers; Type: TABLE; Schema: public; Owner: hamza-nsd
--

CREATE TABLE public.providers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    clinic_id uuid NOT NULL,
    user_id uuid,
    provider_code character varying(50),
    provider_name character varying(200) NOT NULL,
    provider_type character varying(100),
    room_no character varying(50),
    status character varying(20) DEFAULT 'ACTIVE'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.providers OWNER TO "hamza-nsd";

--
-- Name: queue_history; Type: TABLE; Schema: public; Owner: hamza-nsd
--

CREATE TABLE public.queue_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE public.queue_history OWNER TO "hamza-nsd";

--
-- Name: queue_tokens; Type: TABLE; Schema: public; Owner: hamza-nsd
--

CREATE TABLE public.queue_tokens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    visit_id uuid,
    appointment_id uuid,
    service_id uuid,
    provider_id uuid,
    token_number integer,
    status character varying(20) DEFAULT 'PENDING'::character varying
);


ALTER TABLE public.queue_tokens OWNER TO "hamza-nsd";

--
-- Name: refunds; Type: TABLE; Schema: public; Owner: hamza-nsd
--

CREATE TABLE public.refunds (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    payment_id uuid NOT NULL,
    refund_amount numeric(12,2) NOT NULL,
    refund_reason text,
    approved_by uuid,
    refund_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(20) DEFAULT 'PENDING'::character varying
);


ALTER TABLE public.refunds OWNER TO "hamza-nsd";

--
-- Name: reminder_queue; Type: TABLE; Schema: public; Owner: hamza-nsd
--

CREATE TABLE public.reminder_queue (
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE public.reminder_queue OWNER TO "hamza-nsd";

--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: hamza-nsd
--

CREATE TABLE public.role_permissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE public.role_permissions OWNER TO "hamza-nsd";

--
-- Name: roles; Type: TABLE; Schema: public; Owner: hamza-nsd
--

CREATE TABLE public.roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE public.roles OWNER TO "hamza-nsd";

--
-- Name: services; Type: TABLE; Schema: public; Owner: hamza-nsd
--

CREATE TABLE public.services (
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE public.services OWNER TO "hamza-nsd";

--
-- Name: settings; Type: TABLE; Schema: public; Owner: hamza-nsd
--

CREATE TABLE public.settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE public.settings OWNER TO "hamza-nsd";

--
-- Name: user_sessions; Type: TABLE; Schema: public; Owner: hamza-nsd
--

CREATE TABLE public.user_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE public.user_sessions OWNER TO "hamza-nsd";

--
-- Name: users; Type: TABLE; Schema: public; Owner: hamza-nsd
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    clinic_id uuid,
    role_id uuid,
    full_name character varying(200),
    mobile character varying(20)
);


ALTER TABLE public.users OWNER TO "hamza-nsd";

--
-- Name: visits; Type: TABLE; Schema: public; Owner: hamza-nsd
--

CREATE TABLE public.visits (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    clinic_id uuid,
    patient_id uuid,
    visit_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.visits OWNER TO "hamza-nsd";

--
-- Name: vitals; Type: TABLE; Schema: public; Owner: hamza-nsd
--

CREATE TABLE public.vitals (
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE public.vitals OWNER TO "hamza-nsd";

--
-- Name: workflow_steps; Type: TABLE; Schema: public; Owner: hamza-nsd
--

CREATE TABLE public.workflow_steps (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    template_id uuid NOT NULL,
    step_order integer NOT NULL,
    step_name character varying(100) NOT NULL,
    role_name character varying(100),
    is_required boolean DEFAULT true
);


ALTER TABLE public.workflow_steps OWNER TO "hamza-nsd";

--
-- Name: workflow_templates; Type: TABLE; Schema: public; Owner: hamza-nsd
--

CREATE TABLE public.workflow_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    clinic_id uuid NOT NULL,
    service_id uuid,
    template_name character varying(150) NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.workflow_templates OWNER TO "hamza-nsd";

--
-- Name: activity_logs activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_pkey PRIMARY KEY (id);


--
-- Name: ai_consultation_logs ai_consultation_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.ai_consultation_logs
    ADD CONSTRAINT ai_consultation_logs_pkey PRIMARY KEY (id);


--
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);


--
-- Name: assistant_assessments assistant_assessments_pkey; Type: CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.assistant_assessments
    ADD CONSTRAINT assistant_assessments_pkey PRIMARY KEY (id);


--
-- Name: attachment_categories attachment_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.attachment_categories
    ADD CONSTRAINT attachment_categories_pkey PRIMARY KEY (id);


--
-- Name: attachments attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.attachments
    ADD CONSTRAINT attachments_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: clinic_holidays clinic_holidays_pkey; Type: CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.clinic_holidays
    ADD CONSTRAINT clinic_holidays_pkey PRIMARY KEY (id);


--
-- Name: clinics clinics_pkey; Type: CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.clinics
    ADD CONSTRAINT clinics_pkey PRIMARY KEY (id);


--
-- Name: consultation_notes consultation_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.consultation_notes
    ADD CONSTRAINT consultation_notes_pkey PRIMARY KEY (id);


--
-- Name: diagnoses diagnoses_pkey; Type: CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.diagnoses
    ADD CONSTRAINT diagnoses_pkey PRIMARY KEY (id);


--
-- Name: diagnosis_templates diagnosis_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.diagnosis_templates
    ADD CONSTRAINT diagnosis_templates_pkey PRIMARY KEY (id);


--
-- Name: doctor_favourites doctor_favourites_pkey; Type: CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.doctor_favourites
    ADD CONSTRAINT doctor_favourites_pkey PRIMARY KEY (id);


--
-- Name: doctor_schedules doctor_schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.doctor_schedules
    ADD CONSTRAINT doctor_schedules_pkey PRIMARY KEY (id);


--
-- Name: follow_ups follow_ups_pkey; Type: CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.follow_ups
    ADD CONSTRAINT follow_ups_pkey PRIMARY KEY (id);


--
-- Name: invoice_items invoice_items_pkey; Type: CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT invoice_items_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: lab_orders lab_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.lab_orders
    ADD CONSTRAINT lab_orders_pkey PRIMARY KEY (id);


--
-- Name: lab_results lab_results_pkey; Type: CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.lab_results
    ADD CONSTRAINT lab_results_pkey PRIMARY KEY (id);


--
-- Name: medicine_templates medicine_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.medicine_templates
    ADD CONSTRAINT medicine_templates_pkey PRIMARY KEY (id);


--
-- Name: medicines medicines_pkey; Type: CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.medicines
    ADD CONSTRAINT medicines_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: patient_allergies patient_allergies_pkey; Type: CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.patient_allergies
    ADD CONSTRAINT patient_allergies_pkey PRIMARY KEY (id);


--
-- Name: patient_conditions patient_conditions_pkey; Type: CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.patient_conditions
    ADD CONSTRAINT patient_conditions_pkey PRIMARY KEY (id);


--
-- Name: patient_contacts patient_contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.patient_contacts
    ADD CONSTRAINT patient_contacts_pkey PRIMARY KEY (id);


--
-- Name: patient_documents patient_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.patient_documents
    ADD CONSTRAINT patient_documents_pkey PRIMARY KEY (id);


--
-- Name: patient_family patient_family_patient_id_related_patient_id_key; Type: CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.patient_family
    ADD CONSTRAINT patient_family_patient_id_related_patient_id_key UNIQUE (patient_id, related_patient_id);


--
-- Name: patient_family patient_family_pkey; Type: CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.patient_family
    ADD CONSTRAINT patient_family_pkey PRIMARY KEY (id);


--
-- Name: patient_flags patient_flags_pkey; Type: CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.patient_flags
    ADD CONSTRAINT patient_flags_pkey PRIMARY KEY (id);


--
-- Name: patient_identifiers patient_identifiers_pkey; Type: CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.patient_identifiers
    ADD CONSTRAINT patient_identifiers_pkey PRIMARY KEY (id);


--
-- Name: patients patients_pkey; Type: CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: prescription_items prescription_items_pkey; Type: CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.prescription_items
    ADD CONSTRAINT prescription_items_pkey PRIMARY KEY (id);


--
-- Name: prescription_templates prescription_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.prescription_templates
    ADD CONSTRAINT prescription_templates_pkey PRIMARY KEY (id);


--
-- Name: prescriptions prescriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT prescriptions_pkey PRIMARY KEY (id);


--
-- Name: provider_services provider_services_pkey; Type: CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.provider_services
    ADD CONSTRAINT provider_services_pkey PRIMARY KEY (id);


--
-- Name: provider_services provider_services_provider_id_service_id_key; Type: CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.provider_services
    ADD CONSTRAINT provider_services_provider_id_service_id_key UNIQUE (provider_id, service_id);


--
-- Name: providers providers_pkey; Type: CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.providers
    ADD CONSTRAINT providers_pkey PRIMARY KEY (id);


--
-- Name: queue_history queue_history_pkey; Type: CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.queue_history
    ADD CONSTRAINT queue_history_pkey PRIMARY KEY (id);


--
-- Name: queue_tokens queue_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.queue_tokens
    ADD CONSTRAINT queue_tokens_pkey PRIMARY KEY (id);


--
-- Name: refunds refunds_pkey; Type: CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.refunds
    ADD CONSTRAINT refunds_pkey PRIMARY KEY (id);


--
-- Name: reminder_queue reminder_queue_pkey; Type: CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.reminder_queue
    ADD CONSTRAINT reminder_queue_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- Name: user_sessions user_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: visits visits_pkey; Type: CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.visits
    ADD CONSTRAINT visits_pkey PRIMARY KEY (id);


--
-- Name: vitals vitals_pkey; Type: CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.vitals
    ADD CONSTRAINT vitals_pkey PRIMARY KEY (id);


--
-- Name: workflow_steps workflow_steps_pkey; Type: CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.workflow_steps
    ADD CONSTRAINT workflow_steps_pkey PRIMARY KEY (id);


--
-- Name: workflow_steps workflow_steps_template_id_step_order_key; Type: CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.workflow_steps
    ADD CONSTRAINT workflow_steps_template_id_step_order_key UNIQUE (template_id, step_order);


--
-- Name: workflow_templates workflow_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.workflow_templates
    ADD CONSTRAINT workflow_templates_pkey PRIMARY KEY (id);


--
-- Name: idx_patient_identifier; Type: INDEX; Schema: public; Owner: hamza-nsd
--

CREATE UNIQUE INDEX idx_patient_identifier ON public.patient_identifiers USING btree (identifier_type, identifier_value);


--
-- Name: idx_patients_name; Type: INDEX; Schema: public; Owner: hamza-nsd
--

CREATE INDEX idx_patients_name ON public.patients USING btree (first_name, last_name);


--
-- Name: idx_queue_visit; Type: INDEX; Schema: public; Owner: hamza-nsd
--

CREATE INDEX idx_queue_visit ON public.queue_tokens USING btree (visit_id);


--
-- Name: idx_visit_patient; Type: INDEX; Schema: public; Owner: hamza-nsd
--

CREATE INDEX idx_visit_patient ON public.visits USING btree (patient_id);


--
-- Name: appointments appointments_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id);


--
-- Name: appointments appointments_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id);


--
-- Name: appointments appointments_visit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_visit_id_fkey FOREIGN KEY (visit_id) REFERENCES public.visits(id);


--
-- Name: assistant_assessments assistant_assessments_visit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.assistant_assessments
    ADD CONSTRAINT assistant_assessments_visit_id_fkey FOREIGN KEY (visit_id) REFERENCES public.visits(id);


--
-- Name: consultation_notes consultation_notes_provider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.consultation_notes
    ADD CONSTRAINT consultation_notes_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.providers(id);


--
-- Name: consultation_notes consultation_notes_visit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.consultation_notes
    ADD CONSTRAINT consultation_notes_visit_id_fkey FOREIGN KEY (visit_id) REFERENCES public.visits(id);


--
-- Name: patient_contacts patient_contacts_clinic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.patient_contacts
    ADD CONSTRAINT patient_contacts_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES public.clinics(id);


--
-- Name: patient_family patient_family_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.patient_family
    ADD CONSTRAINT patient_family_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;


--
-- Name: patient_family patient_family_related_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.patient_family
    ADD CONSTRAINT patient_family_related_patient_id_fkey FOREIGN KEY (related_patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;


--
-- Name: patient_identifiers patient_identifiers_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.patient_identifiers
    ADD CONSTRAINT patient_identifiers_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;


--
-- Name: patients patients_clinic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES public.clinics(id);


--
-- Name: prescriptions prescriptions_visit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT prescriptions_visit_id_fkey FOREIGN KEY (visit_id) REFERENCES public.visits(id);


--
-- Name: provider_services provider_services_provider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.provider_services
    ADD CONSTRAINT provider_services_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.providers(id) ON DELETE CASCADE;


--
-- Name: provider_services provider_services_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.provider_services
    ADD CONSTRAINT provider_services_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;


--
-- Name: providers providers_clinic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.providers
    ADD CONSTRAINT providers_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES public.clinics(id);


--
-- Name: providers providers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.providers
    ADD CONSTRAINT providers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: queue_tokens queue_tokens_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.queue_tokens
    ADD CONSTRAINT queue_tokens_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id);


--
-- Name: queue_tokens queue_tokens_provider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.queue_tokens
    ADD CONSTRAINT queue_tokens_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.providers(id);


--
-- Name: queue_tokens queue_tokens_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.queue_tokens
    ADD CONSTRAINT queue_tokens_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id);


--
-- Name: queue_tokens queue_tokens_visit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.queue_tokens
    ADD CONSTRAINT queue_tokens_visit_id_fkey FOREIGN KEY (visit_id) REFERENCES public.visits(id);


--
-- Name: refunds refunds_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.refunds
    ADD CONSTRAINT refunds_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: refunds refunds_payment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.refunds
    ADD CONSTRAINT refunds_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES public.payments(id) ON DELETE CASCADE;


--
-- Name: users users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- Name: visits visits_clinic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.visits
    ADD CONSTRAINT visits_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES public.clinics(id);


--
-- Name: visits visits_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.visits
    ADD CONSTRAINT visits_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id);


--
-- Name: workflow_steps workflow_steps_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.workflow_steps
    ADD CONSTRAINT workflow_steps_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.workflow_templates(id) ON DELETE CASCADE;


--
-- Name: workflow_templates workflow_templates_clinic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.workflow_templates
    ADD CONSTRAINT workflow_templates_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES public.clinics(id);


--
-- Name: workflow_templates workflow_templates_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hamza-nsd
--

ALTER TABLE ONLY public.workflow_templates
    ADD CONSTRAINT workflow_templates_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id);


--
-- PostgreSQL database dump complete
--

\unrestrict Tc6DGkVL0tRfx4sdjP6rWPUYABgNo1fiklte5MiJu83l2sUWz9mVdMWW1jzroRo

