/**
 * Layout Map Data Mapper
 * layout-map.html 전용 매핑 함수들을 포함한 클래스
 */
class LayoutMapMapper extends BaseDataMapper {
    constructor() {
        super();
    }

    getLayoutMapData() {
        return this.safeGet(this.data, 'homepage.customFields.pages.layoutMap.sections.0');
    }

    mapHeroSlider() {
        if (!this.isDataLoaded) return;

        const section = this.getLayoutMapData();
        if (!section || !section.hero) return;

        const sliderContainer = document.querySelector('[data-hero-slider]');
        if (!sliderContainer) return;

        sliderContainer.innerHTML = '';

        const images = section.hero.images || [];
        const selectedImages = images.filter(img => img.isSelected).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

        if (selectedImages.length === 0) {
            const slide = document.createElement('div');
            slide.className = 'hero-slide active';
            const img = document.createElement('img');
            if (typeof ImageHelpers !== 'undefined') {
                ImageHelpers.applyPlaceholder(img);
            }
            slide.appendChild(img);
            sliderContainer.appendChild(slide);
            return;
        }

        selectedImages.forEach((imgData, index) => {
            const slide = document.createElement('div');
            slide.className = 'hero-slide';
            if (index === 0) slide.classList.add('active');

            const img = document.createElement('img');
            img.src = imgData.url || '';
            img.alt = this.sanitizeText(imgData.description, `배치도 이미지 ${index + 1}`);
            img.loading = index === 0 ? 'eager' : 'lazy';

            slide.appendChild(img);
            sliderContainer.appendChild(slide);
        });

        const totalSlides = document.querySelector('[data-total-slides]');
        if (totalSlides) {
            totalSlides.textContent = String(selectedImages.length).padStart(2, '0');
        }
    }

    mapLayoutMapContent() {
        if (!this.isDataLoaded) return;

        const section = this.getLayoutMapData();
        if (!section || !section.about) return;

        const titleEl = document.querySelector('[data-layout-map-about-title]');
        if (titleEl) {
            titleEl.textContent = this.sanitizeText(section.about.title, '배치도 타이틀');
        }

        const descEl = document.querySelector('[data-layout-map-about-description]');
        if (descEl) {
            descEl.textContent = this.sanitizeText(section.about.description, '배치도 설명');
        }

        const introSection = document.querySelector('.intro-section');
        if (!introSection) return;

        introSection.innerHTML = '';

        const images = section.about.images || [];
        // isSelected가 true인 이미지만 필터링
        const selectedImages = images.filter(img => img.isSelected).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

        if (selectedImages.length === 0) {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'layout-map-item animate-element';
            const imageWrapperDiv = document.createElement('div');
            imageWrapperDiv.className = 'layout-map-image-wrapper';
            const img = document.createElement('img');
            if (typeof ImageHelpers !== 'undefined') {
                ImageHelpers.applyPlaceholder(img);
            }
            imageWrapperDiv.appendChild(img);
            itemDiv.appendChild(imageWrapperDiv);
            introSection.appendChild(itemDiv);
            return;
        }

        selectedImages.forEach((image, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'layout-map-item animate-element';

            // Image wrapper
            const imageWrapperDiv = document.createElement('div');
            imageWrapperDiv.className = 'layout-map-image-wrapper';

            const img = document.createElement('img');
            if (image.url) {
                img.src = image.url;
            } else {
                if (typeof ImageHelpers !== 'undefined') {
                    ImageHelpers.applyPlaceholder(img);
                }
            }
            img.alt = this.sanitizeText(image.description, `배치도 이미지 ${index + 1}`);

            imageWrapperDiv.appendChild(img);

            // Description wrapper
            const descWrapperDiv = document.createElement('div');
            descWrapperDiv.className = 'layout-map-description-wrapper';

            if (image.description) {
                const descDiv = document.createElement('div');
                descDiv.className = 'layout-map-description';
                descDiv.innerHTML = this._formatTextWithLineBreaks(this.sanitizeText(image.description, ''));
                descWrapperDiv.appendChild(descDiv);
            }

            itemDiv.appendChild(imageWrapperDiv);
            itemDiv.appendChild(descWrapperDiv);
            introSection.appendChild(itemDiv);
        });

        if (typeof window.setupLayoutMapAnimations === 'function') {
            window.setupLayoutMapAnimations();
        }
    }

    mapClosingSection() {
        if (!this.isDataLoaded || !this.data.property) return;

        const exteriorImages = this.getPropertyImages('property_exterior');
        const bannerEl = document.querySelector('[data-main-banner]');
        if (bannerEl) {
            if (exteriorImages.length > 0) {
                bannerEl.style.backgroundImage = `url('${exteriorImages[0].url}')`;
            } else {
                if (typeof ImageHelpers !== 'undefined') {
                    ImageHelpers.applyPlaceholder(bannerEl);
                }
            }
        }

        const propertyNameEn = this.getPropertyNameEn();
        const nameEl = document.querySelector('[data-closing-property-name]');
        if (nameEl) {
            nameEl.textContent = propertyNameEn;
        }
    }

    mapPropertyInfo() {
        const propertyName = this.getPropertyName();
        const nameElements = document.querySelectorAll('[data-property-name]');
        nameElements.forEach(el => {
            el.textContent = propertyName;
        });

        const propertyNameEn = this.getPropertyNameEn();
        const nameEnElements = document.querySelectorAll('[data-property-name-en]');
        nameEnElements.forEach(el => {
            el.textContent = propertyNameEn;
        });
    }

    async mapPage() {
        if (!this.isDataLoaded) return;

        const section = this.getLayoutMapData();
        if (section && section.enabled === false) {
            // Preview 모드에서는 preview 파라미터 유지
            const urlParams = new URLSearchParams(window.location.search);
            const isPreview = urlParams.get('preview');
            let redirectUrl = '404.html';
            if (isPreview) {
                redirectUrl += `?preview=${isPreview}`;
            }
            window.location.href = redirectUrl;
            return;
        }

        this.mapHeroSlider();
        this.mapLayoutMapContent();
        this.mapClosingSection();
        this.mapPropertyInfo();

        // 메타 태그 및 SEO 업데이트 (인증코드 포함, 전 페이지 공통)
        this.updateMetaTags();

        await this.reinitializeScrollAnimations();
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = LayoutMapMapper;
} else {
    window.LayoutMapMapper = LayoutMapMapper;
}
