export const ParagraphSpacingUnit = {
    Pts: 'PTS'
};
export const MarginUnit = {
    Cm: 'CM',
    Inches: 'INCHES'
};
export const DEFAULT_PAGE_OPTIONS = {
    bodyPadding: 0,
    headerHeight: 30,
    footerHeight: 30,
    types: [],
    headerData: [],
    footerData: [],
    pageLayout: {
        margins: {
            top: { unit: MarginUnit.Inches, value: 0.5 },
            bottom: { unit: MarginUnit.Inches, value: 0.5 },
            left: { unit: MarginUnit.Inches, value: 0.5 },
            right: { unit: MarginUnit.Inches, value: 0.5 }
        },
        paragraphSpacing: {
            before: { unit: ParagraphSpacingUnit.Pts, value: 6 },
            after: { unit: ParagraphSpacingUnit.Pts, value: 6 }
        }
    },
    pageNumber: {
        show: false,
        showCount: false,
        showOnFirstPage: false,
        position: null,
        alignment: null
    }
};
export class PageState {
    constructor(bodyOptions, deleting, inserting, splitPage) {
        this.bodyOptions = bodyOptions;
        this.deleting = deleting;
        this.inserting = inserting;
        this.splitPage = splitPage;
    }
    transform(tr) {
        const splitPage = tr.getMeta('splitPage') ?? false;
        const inserting = tr.getMeta('inserting') ?? false;
        const deleting = tr.getMeta('deleting') ?? false;
        return new PageState(this.bodyOptions, deleting, inserting, splitPage);
    }
}
