---
title: "Moving a consultancy off Excel without retyping a single family"
slug: migrating-consultancy-data-from-excel
metaTitle: "Migrating Consultancy Data From Excel to Software"
metaDescription: "How OfficeYak reads an existing spreadsheet, matches the columns itself, and shows exactly what will happen before anything is written."
primaryKeyword: migrating consultancy data from excel
secondaryKeywords:
  - import student data from excel
  - moving from spreadsheets to crm
  - excel to crm migration nepal
  - bulk import leads software
category: Software
author: "The OfficeYak team"
authorRole: "Written for consultancy owners"
reviewedBy: ""
reviewedOn: "2026-10-02"
updatedOn: "2026-10-02"
readingTime: "7 min"
featuredImage: /blog/migrating-consultancy-data-from-excel.svg
featuredImageAlt: "OfficeYak guide to migrating consultancy data from Excel"
internalLinks:
  - /blog/education-consultancy-software-what-matters
  - /blog/student-records-you-must-keep
  - /software/education-consultancy-crm
sources: []
faq:
  - q: "Do the column headings in my spreadsheet need to match anything?"
    a: "No. OfficeYak reads the first row and works out what each column is from common spellings, including Nepali ones. A column called Name, Student Name or नाम is read the same way. Anything it cannot place is listed as ignored rather than guessed at, so nothing is filed under the wrong field."
  - q: "What happens to rows that are missing information?"
    a: "A row with no name is reported and skipped. A row with no phone number is reported and skipped too, because a family nobody can ring is not a working record whatever else is on the row. Every skipped row is listed with the reason, by line number, so you can go back to the spreadsheet and fix it rather than wonder what went missing."
  - q: "Will it create duplicates if a family is already in OfficeYak?"
    a: "It checks every row against your existing records by email first, then by phone number if there is no email, and marks a match as already here rather than adding it again. It also checks the file against itself, so the same family listed twice in your spreadsheet is only added once."
  - q: "Does the import happen immediately when I upload the file?"
    a: "No. Uploading only produces a preview: how many rows are new, how many already exist, and how many could not be read, with the first several new rows shown so you can check they look right. Nothing is written to your account until you look at that preview and press the button to confirm it."
  - q: "Can I take my data back out if OfficeYak is not right for us?"
    a: "Yes, from the same page. One download gives you every enquiry, student, application, fee, class, attendance and payroll record as a spreadsheet with real column names, so it opens in Excel or loads into whatever comes next. A system is only safe to move into if moving back out is just as plain."
---

**You do not retype four hundred families to switch off a spreadsheet.** Save the file as CSV, upload it, and the column headings are read automatically, whatever they happen to be called. What would have been added, what is already on file, and what could not be read are all shown before anything is written. Nothing changes in your account until you look at that list and confirm it.

This is the step that stops most offices from ever leaving the spreadsheet they already know is failing them, which is usually the same hesitation covered in [what actually matters when choosing software](/blog/education-consultancy-software-what-matters) in the first place. Here is exactly what happens, in order.

## The column names do not have to match anything

A spreadsheet maintained by hand rarely has consistent headers, let alone headers that match a particular piece of software. One counsellor wrote "Student Name", another wrote "Name", an older export says "Candidate Name", and a sheet kept by a Nepali-speaking counsellor might use "नाम". OfficeYak reads the first row and matches each heading against the common ways people actually write it, not against a list you have to conform to first.

A column it cannot place is not guessed at. It is listed as ignored, next to the columns it did understand, so you can see exactly what was read and what was not before deciding whether that column mattered.

## What the upload actually produces

Uploading a CSV does not import anything by itself. It produces a plan: how many rows will be added, how many already exist in your account, and how many rows could not be read at all, with the reason for each one. The first several rows that will be added are shown in full, so you can check a name and phone number look right before anything is confirmed.

This two-step shape exists because a bad import is worse than no import. An office bringing a few hundred families across from a spreadsheet is making a decision it cannot easily undo by accident, and seeing the outcome before it happens is the difference between a tool an office trusts with its records and one it does not.

## Why a phone number is required and a name is not negotiable

Two things stop a row from being imported: no name, or no phone number. A name is how a counsellor recognises the family on the board. A phone number is how the office actually reaches them, and a record nobody can call is a name on a list, not a lead. Both kinds of skipped row are reported by line number rather than silently dropped, so a spreadsheet with forty blank phone columns does not quietly lose forty families on the way in. It tells you which forty, and you go back to the original sheet and fill them in.

## It will not file the same family twice

Before anything is added, each row is checked against the records already in your account by email, and by phone number when there is no email, since plenty of families have a phone number and no email address that is checked regularly. A match is marked as already here. The same check runs across the file itself, so if the same student appears on two rows of your spreadsheet, perhaps because two counsellors each kept their own copy, only one of them is added.

## Where the data lands

Every row that comes in arrives as an enquiry, on the [same board a walk-in lands on](/software/enquiry-management-software), marked as imported so you can always tell an old record from a new one. This is deliberate rather than a shortcut. An imported row is somebody the office already knows about; it is not the same as somebody who has agreed to log into a system and been given a password. If a family already has an active arrangement with you, you move them from enquiry to student the same way you would with anyone who just signed, which keeps the step where a real person looks at the record before it becomes a formal file.

## What this does not bring across

A spreadsheet holds names, numbers and notes. It does not hold the passport scan, the bank statement or the signed agreement sitting in a folder on someone's laptop. Those documents still have to be uploaded to each student's file individually once the record exists. The spreadsheet import solves the retyping problem; it is not a replacement for gathering the paperwork that was never in the spreadsheet to begin with.

## Getting the spreadsheet ready

Three things make the upload go cleanly:

- **Save it as CSV first.** In Excel or Google Sheets, that is File, then Download or Save As, then CSV.
- **One row per family**, with the first row holding the column headings, whatever you already call them.
- **A phone number on every row you want kept.** If a family's number is missing, this is the moment to go and find it, because it will otherwise be reported and left out.

Nothing else needs tidying. The column order does not matter, extra columns are simply ignored rather than rejected, and there is no template to copy the spreadsheet into first.

## Leaving has to be as plain as arriving

The same page that brings a spreadsheet in also sends everything back out, as a set of spreadsheets with real column names: every enquiry, student, application, fee, class, attendance and payroll record, in one download. No passwords are included. A consultancy that cannot picture how it would leave [a CRM built for the whole office](/software/education-consultancy-crm) is right to be wary of moving into it, and the honest answer to that is to make the exit as plain as the entry, not to promise it will never be needed.
