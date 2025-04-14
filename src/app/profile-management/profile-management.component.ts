import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
} from '@angular/forms';

interface Skill {
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'; // Defined as a union type
  years: number;
}
interface Education {
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  current: boolean;
}

interface Experience {
  company: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

interface Project {
  name: string;
  description: string;
  url: string;
  technologies: string[];
}

@Component({
  selector: 'app-profile-management',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './profile-management.component.html',
  styleUrl: './profile-management.component.scss',
})
export class ProfileManagementComponent implements OnInit {
  userForm!: FormGroup;
  skillsForm!: FormGroup;
  educationForm!: FormGroup;
  experienceForm!: FormGroup;
  projectsForm!: FormGroup;

  activeSection: 'basic' | 'skills' | 'education' | 'experience' | 'projects' =
    'basic';
  isLoading = true;

  // For skills input
  newSkill = '';
  skillLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
  suggestionSkills: string[] = [
    'JavaScript',
    'TypeScript',
    'Angular',
    'React',
    'Vue.js',
    'HTML',
    'CSS',
    'SCSS',
    'Node.js',
    'Express',
    'MongoDB',
    'SQL',
    'PostgreSQL',
    'Git',
    'Docker',
    'AWS',
    'Azure',
  ];
  showSkillSuggestions = false;
  filteredSkillSuggestions: string[] = [];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForms();
    this.loadUserData();
  }

  initializeForms(): void {
    // Basic info form
    this.userForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      jobTitle: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^\+?[0-9]{10,15}$/)]],
      location: [''],
      about: ['', [Validators.maxLength(500)]],
      linkedin: [''],
      github: [''],
      portfolio: [''],
    });

    // Skills form
    this.skillsForm = this.fb.group({
      skills: this.fb.array([]),
    });

    // Education form
    this.educationForm = this.fb.group({
      education: this.fb.array([]),
    });

    // Experience form
    this.experienceForm = this.fb.group({
      experience: this.fb.array([]),
    });

    // Projects form
    this.projectsForm = this.fb.group({
      projects: this.fb.array([]),
    });
  }

  // Load mock user data
  loadUserData(): void {
    setTimeout(() => {
      // Mock user data
      const userData = {
        firstName: 'John',
        lastName: 'Smith',
        jobTitle: 'Frontend Developer',
        email: 'john.smith@example.com',
        phone: '+1234567890',
        location: 'San Francisco, CA',
        about:
          'Experienced frontend developer with a passion for creating user-friendly interfaces. Skilled in Angular, React, and TypeScript.',
        linkedin: 'https://linkedin.com/in/johnsmith',
        github: 'https://github.com/johnsmith',
        portfolio: 'https://johnsmith.dev',
        skills: [
          { name: 'JavaScript', level: 'Expert', years: 5 },
          { name: 'TypeScript', level: 'Advanced', years: 3 },
          { name: 'Angular', level: 'Advanced', years: 3 },
          { name: 'React', level: 'Intermediate', years: 2 },
          { name: 'HTML/CSS', level: 'Expert', years: 5 },
        ],
        education: [
          {
            school: 'University of California, Berkeley',
            degree: 'Bachelor of Science',
            field: 'Computer Science',
            startDate: '2015-09-01',
            endDate: '2019-05-30',
            current: false,
          },
        ],
        experience: [
          {
            company: 'TechCorp Inc.',
            title: 'Frontend Developer',
            location: 'San Francisco, CA',
            startDate: '2019-07-01',
            endDate: '',
            current: true,
            description:
              'Developing and maintaining web applications using Angular and TypeScript. Working closely with UX designers and backend developers to deliver high-quality products.',
          },
          {
            company: 'StartupXYZ',
            title: 'Junior Developer',
            location: 'Oakland, CA',
            startDate: '2017-06-01',
            endDate: '2019-06-30',
            current: false,
            description:
              'Worked on frontend development using React and JavaScript. Participated in code reviews and implemented new features.',
          },
        ],
        projects: [
          {
            name: 'E-commerce Dashboard',
            description:
              'A responsive dashboard for e-commerce analytics with charts and data visualization.',
            url: 'https://github.com/johnsmith/ecommerce-dashboard',
            technologies: ['Angular', 'TypeScript', 'Chart.js', 'SCSS'],
          },
          {
            name: 'Weather App',
            description:
              'A weather application that displays current and forecasted weather using the OpenWeather API.',
            url: 'https://github.com/johnsmith/weather-app',
            technologies: ['React', 'JavaScript', 'API Integration'],
          },
        ],
      };

      // Populate basic info form
      this.userForm.patchValue(userData);

      // Populate skills form
      const skillsArray = this.skillsForm.get('skills') as FormArray;
      userData.skills.forEach((skill) => {
        skillsArray.push(this.createSkillFormGroup());
      });

      // Populate education form
      const educationArray = this.educationForm.get('education') as FormArray;
      userData.education.forEach((edu) => {
        educationArray.push(this.createEducationFormGroup(edu));
      });

      // Populate experience form
      const experienceArray = this.experienceForm.get(
        'experience'
      ) as FormArray;
      userData.experience.forEach((exp) => {
        experienceArray.push(this.createExperienceFormGroup(exp));
      });

      // Populate projects form
      const projectsArray = this.projectsForm.get('projects') as FormArray;
      userData.projects.forEach((proj) => {
        projectsArray.push(this.createProjectFormGroup(proj));
      });

      this.isLoading = false;
    }, 1000);
  }

  // Form array getters
  get skillsArray(): FormArray {
    return this.skillsForm.get('skills') as FormArray;
  }

  get educationArray(): FormArray {
    return this.educationForm.get('education') as FormArray;
  }

  get experienceArray(): FormArray {
    return this.experienceForm.get('experience') as FormArray;
  }

  get projectsArray(): FormArray {
    return this.projectsForm.get('projects') as FormArray;
  }

  // Create form groups for arrays
  createSkillFormGroup(skill?: Skill): FormGroup {
    return this.fb.group({
      name: [skill?.name || '', Validators.required],
      level: [skill?.level || 'Beginner', Validators.required],
      years: [skill?.years || 0, [Validators.required, Validators.min(0)]],
    });
  }

  createEducationFormGroup(education?: Education): FormGroup {
    return this.fb.group({
      school: [education?.school || '', Validators.required],
      degree: [education?.degree || '', Validators.required],
      field: [education?.field || '', Validators.required],
      startDate: [education?.startDate || '', Validators.required],
      endDate: [education?.endDate || ''],
      current: [education?.current || false],
    });
  }

  createExperienceFormGroup(experience?: Experience): FormGroup {
    return this.fb.group({
      company: [experience?.company || '', Validators.required],
      title: [experience?.title || '', Validators.required],
      location: [experience?.location || ''],
      startDate: [experience?.startDate || '', Validators.required],
      endDate: [experience?.endDate || ''],
      current: [experience?.current || false],
      description: [experience?.description || ''],
    });
  }

  createProjectFormGroup(project?: Project): FormGroup {
    return this.fb.group({
      name: [project?.name || '', Validators.required],
      description: [project?.description || ''],
      url: [project?.url || ''],
      technologies: [project?.technologies?.join(', ') || ''],
    });
  }

  // Add/remove form array items
  addSkill(): void {
    if (!this.newSkill.trim()) return;

    // Check if skill already exists
    const existingSkill = this.skillsArray.value.find(
      (s: any) => s.name.toLowerCase() === this.newSkill.toLowerCase()
    );

    if (existingSkill) {
      alert('This skill is already added to your profile');
      return;
    }

    const newSkill: Skill = {
      name: this.newSkill.trim(),
      level: 'Beginner',
      years: 1,
    };

    this.skillsArray.push(this.createSkillFormGroup(newSkill));
    this.newSkill = '';
    this.showSkillSuggestions = false;
  }

  removeSkill(index: number): void {
    this.skillsArray.removeAt(index);
  }

  addEducation(): void {
    this.educationArray.push(this.createEducationFormGroup());
  }

  removeEducation(index: number): void {
    this.educationArray.removeAt(index);
  }

  addExperience(): void {
    this.experienceArray.push(this.createExperienceFormGroup());
  }

  removeExperience(index: number): void {
    this.experienceArray.removeAt(index);
  }

  addProject(): void {
    this.projectsArray.push(this.createProjectFormGroup());
  }

  removeProject(index: number): void {
    this.projectsArray.removeAt(index);
  }

  // Current education/experience toggle
  toggleCurrentEducation(index: number): void {
    const education = this.educationArray.at(index) as FormGroup;
    const current = education.get('current')?.value;

    if (current) {
      education.get('endDate')?.setValue('');
    }
  }

  toggleCurrentExperience(index: number): void {
    const experience = this.experienceArray.at(index) as FormGroup;
    const current = experience.get('current')?.value;

    if (current) {
      experience.get('endDate')?.setValue('');
    }
  }

  // Skill suggestions
  filterSkillSuggestions(): void {
    if (!this.newSkill.trim()) {
      this.filteredSkillSuggestions = [];
      return;
    }

    const term = this.newSkill.toLowerCase().trim();
    this.filteredSkillSuggestions = this.suggestionSkills.filter((skill) =>
      skill.toLowerCase().includes(term)
    );

    // Don't show suggestions if the exact skill is typed
    if (
      this.filteredSkillSuggestions.length === 1 &&
      this.filteredSkillSuggestions[0].toLowerCase() === term
    ) {
      this.filteredSkillSuggestions = [];
    }
  }

  onSkillInputFocus(): void {
    this.showSkillSuggestions = true;
    this.filterSkillSuggestions();
  }

  onSkillInputBlur(): void {
    // Delay hiding suggestions to allow clicks on the suggestions
    setTimeout(() => {
      this.showSkillSuggestions = false;
    }, 200);
  }

  selectSkillSuggestion(skill: string): void {
    this.newSkill = skill;
    this.showSkillSuggestions = false;
    this.addSkill();
  }

  // Form submission
  saveProfile(): void {
    if (this.activeSection === 'basic' && this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    console.log('Saving profile...');
    console.log('Basic Info:', this.userForm.value);
    console.log('Skills:', this.skillsForm.value);
    console.log('Education:', this.educationForm.value);
    console.log('Experience:', this.experienceForm.value);
    console.log('Projects:', this.projectsForm.value);

    // In a real app, would call a service to update the profile
    alert('Profile updated successfully!');
  }

  // Navigation
  setActiveSection(
    section: 'basic' | 'skills' | 'education' | 'experience' | 'projects'
  ): void {
    this.activeSection = section;
  }

  // Helper functions
  getProfileCompleteness(): number {
    let completeness = 0;
    let totalFields = 0;

    // Basic info - count filled fields out of 10 possible fields
    const basicFields = Object.values(this.userForm.value).filter(
      (val) => val !== '' && val !== null
    );
    completeness += basicFields.length;
    totalFields += 10;

    // Skills - if has at least 3 skills
    completeness += this.skillsArray.length >= 3 ? 1 : 0;
    totalFields += 1;

    // Education - if has at least 1 education entry
    completeness += this.educationArray.length >= 1 ? 1 : 0;
    totalFields += 1;

    // Experience - if has at least 1 experience entry
    completeness += this.experienceArray.length >= 1 ? 1 : 0;
    totalFields += 1;

    // Projects - if has at least 1 project
    completeness += this.projectsArray.length >= 1 ? 1 : 0;
    totalFields += 1;

    return Math.round((completeness / totalFields) * 100);
  }

  getYearsText(years: number): string {
    return years === 1 ? '1 year' : `${years} years`;
  }
}
