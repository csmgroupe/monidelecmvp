import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { Logo } from '@/components/Logo';

interface PricingTierProps {
  name: string;
  price: number;
  annualPrice?: number;
  description: string;
  projectsPerMonth: string;
  features: string[];
  isPopular?: boolean;
}

const PricingTier = ({ name, price, annualPrice, description, projectsPerMonth, features, isPopular = false }: PricingTierProps) => (
  <div className={`p-8 bg-white rounded-xl shadow-lg relative ${isPopular ? 'border-2 border-blue-500 ring-4 ring-blue-500/10' : ''}`}>
    {isPopular && (
      <span className="absolute -top-4 right-4 bg-blue-500 text-white px-3 py-1 text-sm font-medium rounded-full">
        Populaire
      </span>
    )}
    <h3 className="text-2xl font-bold text-gray-900 mb-2">{name}</h3>
    <p className="text-gray-600 text-sm mb-4">{description}</p>
    <div className="mb-6">
      <span className="text-5xl font-bold text-gray-900">{price}€</span>
      <span className="text-gray-600">/mois</span>
      {annualPrice && (
        <div>
          <div className="text-sm text-green-600 font-medium">
            Économisez {name === "Starter" ? "118" : name === "Pro" ? "308" : "598"}€/an
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            En un seul paiement annuel
          </div>
        </div>
      )}
    </div>
    <div className="text-blue-500 font-semibold mb-6">
      {projectsPerMonth}
    </div>
    <ul className="space-y-4 mb-8">
      {features.map((feature, index) => (
        <li key={index} className="flex items-start">
          <CheckCircle className="w-5 h-5 mr-3 text-blue-500 flex-shrink-0 mt-0.5" />
          <span className="text-gray-600">{feature}</span>
        </li>
      ))}
    </ul>
    <Link
      to="/auth/register"
      className={`block w-full py-3 px-4 text-center rounded-lg font-medium transition-all duration-200 ${
        isPopular
          ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg hover:shadow-blue-500/25'
          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
      }`}
    >
      Choisir ce plan
    </Link>
  </div>
);

export const Landing = () => {
  const [isAnnual, setIsAnnual] = useState(true);
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-8">
              <Logo />
              <div className="hidden md:flex space-x-8">
                <a
                  href="#features"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    document.querySelector('#features')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Fonctionnalités
                </a>
                <a
                  href="#pricing"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    document.querySelector('#pricing')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Prix
                </a>
                <a
                  href="#contact"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Contact
                </a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/auth/login" className="text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg px-4 py-2">
                Se connecter
              </Link>
              <Link
                to="/auth/register"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition duration-150"
              >
                Démarrer maintenant
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Add padding to account for fixed navbar */}
      <div className="pt-16">
        {/* Hero Section */}
        <div className="bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Solutions intelligentes pour</span>
                <span className="block text-indigo-600">les professionnels du bâtiment</span>
              </h1>
              <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                Gagnez du temps dans vos prises de décisions et vos chiffrages grâce à notre plateforme propulsée par l'IA.
              </p>
              <div className="mt-5 flex justify-center space-x-4 md:mt-8">
                <div>
                  <Link
                    to="/auth/register"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
                  >
                    Démarrer maintenant
                  </Link>
                </div>
                <div>
                  <a
                    href="#contact"
                    className="w-full flex items-center justify-center px-8 py-3 text-base font-medium rounded-md text-gray-500 hover:text-gray-700 border border-gray-200 md:py-4 md:text-lg md:px-10"
                  >
                    Nous contacter
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
                Une solution complète pour vos projets
              </h2>
              <p className="text-xl text-gray-600 mb-16">
                Découvrez comment notre plateforme révolutionne la gestion de vos chantiers
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-xl shadow-lg">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-indigo-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 20L3 17V4L9 7M9 20L15 17M9 20V7M15 17L21 20V7L15 4M15 17V4M9 7L15 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Analyse de plans</h3>
                <p className="text-gray-600">
                  Notre IA analyse vos plans et détecte automatiquement tous les éléments électriques nécessaires à votre chiffrage.
                </p>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-lg">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-indigo-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Gain de temps</h3>
                <p className="text-gray-600">
                  Réduisez considérablement le temps passé sur vos estimations grâce à notre système d'analyse automatisée.
                </p>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-lg">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-indigo-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Précision optimale</h3>
                <p className="text-gray-600">
                  Bénéficiez d'une précision exceptionnelle dans vos chiffrages grâce à notre base de données constamment mise à jour.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div id="pricing" className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
                Plans & Tarification
              </h2>
              <p className="text-xl text-gray-600 mb-12">
                Choisissez le plan qui correspond le mieux à votre activité
              </p>
              <div className="flex items-center justify-center gap-4 mb-12">
                <span className={`text-sm font-medium ${!isAnnual ? 'text-blue-600' : 'text-gray-500'}`}>Mensuel</span>
                <button
                  onClick={() => setIsAnnual(!isAnnual)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isAnnual ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isAnnual ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className={`text-sm font-medium ${isAnnual ? 'text-blue-600' : 'text-gray-500'}`}>
                  Annuel (-20%)
                </span>
              </div>
            </div>
            <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <PricingTier
                name="Starter"
                price={isAnnual ? 39 : 49}
                annualPrice={isAnnual ? 470 : undefined}
                description="Pour les petits professionnels et artisans débutants"
                projectsPerMonth="10 projets/mois"
                features={[
                  'Analyse des plans ≤ 100 m²',
                  'Support email (48h)',
                  'Mises à jour gratuites'
                ]}
              />
              <PricingTier
                name="Pro"
                price={isAnnual ? 103 : 129}
                annualPrice={isAnnual ? 1240 : undefined}
                description="Pour les entreprises intermédiaires et bureaux d'études"
                projectsPerMonth="30 projets/mois"
                features={[
                  'Toutes les fonctionnalités Starter',
                  'Surface illimitée',
                  'Support prioritaire (24h)',
                  '3 utilisateurs inclus'
                ]}
                isPopular={true}
              />
              <PricingTier
                name="Expert"
                price={isAnnual ? 199 : 249}
                annualPrice={isAnnual ? 2390 : undefined}
                description="Pour les grandes entreprises et réseaux de franchises"
                projectsPerMonth="100 projets/mois"
                features={[
                  'Toutes les fonctionnalités Pro',
                  'Support dédié (4h)',
                  'Formation sur site annuelle',
                  '10 utilisateurs inclus'
                ]}
              />
            </div>
          </div>
        </div>

        {/* Contact Form Section */}
        <div id="contact" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-8">
              {/* Left Column - Contact Info */}
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Contactez-nous</h2>
                <p className="text-lg text-gray-600 mb-8">
                  Une question ? Notre équipe est là pour vous aider. Contactez-nous par
                  email, téléphone ou via le formulaire.
                </p>
                <div className="space-y-6">
                  <div className="flex items-center">
                    <svg className="w-6 h-6 text-blue-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 8L10.89 13.26C11.2187 13.4793 11.6049 13.5963 12 13.5963C12.3951 13.5963 12.7813 13.4793 13.11 13.26L21 8M5 19H19C19.5304 19 20.0391 18.7893 20.4142 18.4142C20.7893 18.0391 21 17.5304 21 17V7C21 6.46957 20.7893 5.96086 20.4142 5.58579C20.0391 5.21071 19.5304 5 19 5H5C4.46957 5 3.96086 5.21071 3.58579 5.58579C3.21071 5.96086 3 6.46957 3 7V17C3 17.5304 3.21071 18.0391 3.58579 18.4142C3.96086 18.7893 4.46957 19 5 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="ml-3 text-gray-600">contact@ab-concept.fr</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-6 h-6 text-blue-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 5.5C3 14.0604 9.93959 21 18.5 21C19.3284 21 20 20.3284 20 19.5V16.4188C20 15.6647 19.4716 15.0155 18.7307 14.8224L15.6027 14.0529C14.9166 13.8739 14.1924 14.0972 13.7353 14.6358L13 15.5C11.5 14.75 9.25 12.5 8.5 11L9.36425 10.2647C9.90283 9.80761 10.1261 9.08341 9.94707 8.39728L9.17757 5.26927C8.98453 4.52837 8.33532 4 7.58124 4H4.5C3.67157 4 3 4.67157 3 5.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="ml-3 text-gray-600">+33 7 61 13 03 68</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-6 h-6 text-blue-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.6569 16.6569C16.7202 17.5935 14.7616 19.5521 13.4142 20.8995C12.6332 21.6805 11.3668 21.6805 10.5858 20.8995C9.26105 19.5748 7.34692 17.6606 6.34315 16.6569C3.21895 13.5327 3.21895 8.46734 6.34315 5.34315C9.46734 2.21895 14.5327 2.21895 17.6569 5.34315C20.781 8.46734 20.781 13.5327 17.6569 16.6569Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="ml-3 text-gray-600">26700 Pierrelatte, France</span>
                  </div>
                </div>
              </div>
              {/* Right Column - Contact Form */}
              <div>
                <form
                  action="https://hook.eu1.make.com/your-webhook-id"
                  method="POST"
                  className="space-y-6"
                >
                  <div className="grid grid-cols-2 gap-x-4">
                    <input
                      type="text"
                      name="firstName"
                      placeholder="Prénom"
                      required
                      className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Nom"
                      required
                      className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    required
                    className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <textarea
                    name="message"
                    placeholder="Message"
                    rows={6}
                    required
                    className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  ></textarea>
                  <button
                    type="submit"
                    className="w-full py-3 px-6 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  >
                    Envoyer le message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-900">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className="text-white">
                <Logo className="h-8" />
                <p className="mt-4 text-base text-gray-400">
                  Solutions innovantes pour les professionnels du bâtiment.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                  Navigation
                </h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <a href="#" className="text-base text-gray-300 hover:text-white">
                      Accueil
                    </a>
                  </li>
                  <li>
                    <Link to="/auth/login" className="text-base text-gray-300 hover:text-white">
                      Connexion
                    </Link>
                  </li>
                  <li>
                    <Link to="/auth/register" className="text-base text-gray-300 hover:text-white">
                      Inscription
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                  Contact
                </h3>
                <ul className="mt-4 space-y-4">
                  <li className="text-base text-gray-300">
                    Email: contact@ab-concept.fr
                  </li>
                  <li className="text-base text-gray-300">
                    Tél: +33 7 61 13 03 68
                  </li>
                  <li className="text-base text-gray-300">
                    26700 Pierrelatte, France
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-8 border-t border-gray-700 pt-8">
              <p className="text-base text-gray-400 text-center">
                © 2025 ABELEC Distribution. Tous droits réservés.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
